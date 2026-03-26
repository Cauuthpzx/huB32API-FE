# HUB32 Agent — WebRTC Producer Specification
# Phase 4-5: H.264 Encode + libdatachannel WebRTC
# Version: 1.0 | Date: 2026-03-26
# Target: Claude Code implementation guide

---

## 1. OVERVIEW

### Mục tiêu
Biến hub32-agent từ REST-only client thành WebRTC producer:
DXGI capture → NV12 convert → H.264 encode → RTP packetize → WebRTC → SFU

### Hiện trạng Agent (~95% done)
```
✅ DXGI Screen Capture (703 lines, 100%)
✅ GDI Fallback
✅ ScreenLock, InputLock, MessageDisplay, PowerControl
✅ CommandDispatcher, AgentClient (REST), WinServiceAdapter, Config
❌ FFmpeg H.264 encode (0%)
❌ libdatachannel WebRTC producer (0%)
```

### Dependencies cần thêm
```
FFmpeg libavcodec + libavutil + libswscale    — H.264 encode (NVENC/QSV/x264)
libdatachannel                                 — WebRTC transport (C++17, MPL-2.0)
libyuv (optional)                              — BGRA→NV12 nếu không dùng D3D11 shader
```

---

## 2. ARCHITECTURE

### Pipeline tổng thể
```
┌─────────────────────────────────────────────────────────────────────┐
│                         hub32-agent.exe                             │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────────┐    │
│  │ DXGI Desktop │    │ Color Convert│    │ H.264 Encoder      │    │
│  │ Duplication  │───>│ BGRA → NV12  │───>│ NVENC/QSV/x264     │    │
│  │              │    │              │    │                    │    │
│  │ ID3D11       │    │ D3D11 Shader │    │ FFmpeg libavcodec  │    │
│  │ Texture2D    │    │ or libyuv    │    │                    │    │
│  └──────────────┘    └──────────────┘    └────────┬───────────┘    │
│                                                    │                │
│                                          H.264 NAL units            │
│                                                    │                │
│  ┌──────────────────────────────────────────────────▼───────────┐   │
│  │ libdatachannel WebRTC                                        │   │
│  │                                                              │   │
│  │  PeerConnection → DTLS/SRTP → RTP H.264 packets → SFU      │   │
│  │                                                              │   │
│  │  Simulcast: Layer 0 (150kbps) + Layer 1 (500kbps)           │   │
│  │             + Layer 2 (2500kbps)                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐                              │
│  │ REST Client  │    │ Feature      │    (existing, no changes)    │
│  │ (heartbeat,  │    │ Handlers     │                              │
│  │  commands)   │    │ (lock, msg)  │                              │
│  └──────────────┘    └──────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Encoder fallback chain
```
1. Try NVENC (NVIDIA GPU)     → h264_nvenc    → latency ~5ms
   Detect: avcodec_find_encoder_by_name("h264_nvenc") != nullptr
   
2. Try QSV (Intel iGPU)       → h264_qsv     → latency ~8ms
   Detect: avcodec_find_encoder_by_name("h264_qsv") != nullptr
   
3. Fallback x264 (CPU)        → libx264       → latency ~15ms
   Always available, preset "ultrafast", tune "zerolatency"
```

---

## 3. FILE STRUCTURE (new files to add)

```
agent/
├── src/
│   ├── capture/                    # EXISTING — no changes
│   │   ├── DxgiCapture.hpp/cpp
│   │   └── GdiCapture.hpp/cpp
│   │
│   ├── encode/                     # NEW — Phase 4
│   │   ├── ColorConverter.hpp         # BGRA→NV12 conversion interface
│   │   ├── ColorConverter.cpp         # D3D11 shader + libyuv fallback
│   │   ├── H264Encoder.hpp            # Encoder interface
│   │   ├── H264Encoder.cpp            # FFmpeg encoder (NVENC/QSV/x264)
│   │   └── EncoderFactory.hpp         # Auto-detect best encoder
│   │
│   ├── webrtc/                     # NEW — Phase 5
│   │   ├── WebRtcProducer.hpp         # Main producer class
│   │   ├── WebRtcProducer.cpp         # libdatachannel integration
│   │   ├── SignalingClient.hpp        # REST signaling with hub32api
│   │   ├── SignalingClient.cpp
│   │   ├── RtpPacketizer.hpp          # H.264 NAL → RTP packets
│   │   └── RtpPacketizer.cpp
│   │
│   ├── pipeline/                   # NEW — glue capture+encode+webrtc
│   │   ├── StreamPipeline.hpp         # Orchestrator class
│   │   └── StreamPipeline.cpp
│   │
│   ├── features/                   # EXISTING — no changes
│   ├── service/                    # EXISTING — minor changes (start pipeline)
│   └── main.cpp                    # EXISTING — add pipeline startup
│
├── CMakeLists.txt                  # UPDATE — add FFmpeg, libdatachannel
└── vcpkg.json                      # UPDATE — add dependencies
```

---

## 4. COLOR CONVERTER (BGRA → NV12)

### Interface
```cpp
// encode/ColorConverter.hpp
#pragma once
#include <cstdint>
#include <memory>

namespace hub32::agent {

class ColorConverter {
public:
    virtual ~ColorConverter() = default;
    
    // Convert BGRA frame to NV12
    // Input: bgra_data (width * height * 4 bytes, DXGI_FORMAT_B8G8R8A8_UNORM)
    // Output: nv12_data (width * height * 3/2 bytes)
    virtual bool convert(
        const uint8_t* bgra_data, int bgra_stride,
        uint8_t* nv12_y, int y_stride,
        uint8_t* nv12_uv, int uv_stride,
        int width, int height
    ) = 0;
    
    static std::unique_ptr<ColorConverter> create(bool prefer_gpu);
};

// GPU path: D3D11 Compute Shader (zero-copy if DXGI texture stays on GPU)
class D3D11ColorConverter : public ColorConverter { ... };

// CPU path: libyuv (fallback)
class LibyuvColorConverter : public ColorConverter { ... };

} // namespace hub32::agent
```

### GPU path (preferred)
```
DXGI AcquireNextFrame() → ID3D11Texture2D (BGRA, on GPU)
                          ↓
         D3D11 Compute Shader: BGRA → NV12 (stays on GPU)
                          ↓
         NVENC reads NV12 directly from GPU memory
         
Result: Frame NEVER touches CPU memory = near-zero CPU usage
```

### CPU path (fallback)
```
DXGI AcquireNextFrame() → Map to CPU → BGRA buffer
                          ↓
         libyuv::ARGBToNV12() (SIMD optimized)
                          ↓
         x264/QSV reads NV12 from CPU memory
```

---

## 5. H.264 ENCODER

### Interface
```cpp
// encode/H264Encoder.hpp
#pragma once
#include <cstdint>
#include <vector>
#include <string>
#include <functional>

struct AVCodecContext;
struct AVFrame;
struct AVPacket;

namespace hub32::agent {

struct EncoderConfig {
    int width  = 1920;
    int height = 1080;
    int fps    = 15;                   // frames per second
    int bitrate_kbps = 2500;           // target bitrate
    int keyframe_interval = 60;        // GOP size (frames between keyframes)
    std::string preset = "ultrafast";  // x264 only
    std::string tune = "zerolatency";  // x264 only
};

// Simulcast layer config
struct SimulcastLayer {
    int width;
    int height;
    int bitrate_kbps;
    int fps;
};

// Pre-defined simulcast layers
constexpr SimulcastLayer kLayerThumbnail = { 320,  180,  150, 10 };  // Layer 0
constexpr SimulcastLayer kLayerMedium    = { 640,  360,  500, 15 };  // Layer 1
constexpr SimulcastLayer kLayerFull      = { 1280, 720, 2500, 15 };  // Layer 2

using EncodedCallback = std::function<void(
    const uint8_t* data, size_t size,   // H.264 NAL unit
    int64_t pts,                        // presentation timestamp
    bool is_keyframe                    // IDR frame?
)>;

class H264Encoder {
public:
    virtual ~H264Encoder() = default;
    
    virtual bool initialize(const EncoderConfig& config) = 0;
    virtual void shutdown() = 0;
    
    // Encode one NV12 frame, calls callback with each NAL unit
    virtual bool encode(
        const uint8_t* nv12_y, int y_stride,
        const uint8_t* nv12_uv, int uv_stride,
        int64_t pts,
        EncodedCallback callback
    ) = 0;
    
    // Force next frame to be keyframe (for new consumer joining)
    virtual void request_keyframe() = 0;
    
    // Runtime bitrate change (for adaptive)
    virtual void set_bitrate(int kbps) = 0;
    
    virtual std::string encoder_name() const = 0;  // "h264_nvenc", "h264_qsv", "libx264"
};

} // namespace hub32::agent
```

### FFmpeg implementation
```cpp
// encode/H264Encoder.cpp — core encode loop

bool FFmpegH264Encoder::encode(
    const uint8_t* nv12_y, int y_stride,
    const uint8_t* nv12_uv, int uv_stride,
    int64_t pts,
    EncodedCallback callback)
{
    // 1. Fill AVFrame with NV12 data
    m_frame->data[0] = const_cast<uint8_t*>(nv12_y);
    m_frame->data[1] = const_cast<uint8_t*>(nv12_uv);
    m_frame->linesize[0] = y_stride;
    m_frame->linesize[1] = uv_stride;
    m_frame->pts = pts;
    m_frame->format = AV_PIX_FMT_NV12;
    
    // 2. Send frame to encoder
    int ret = avcodec_send_frame(m_ctx, m_frame);
    if (ret < 0) return false;
    
    // 3. Receive encoded packets
    while (true) {
        ret = avcodec_receive_packet(m_ctx, m_packet);
        if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF) break;
        if (ret < 0) return false;
        
        bool is_key = (m_packet->flags & AV_PKT_FLAG_KEY) != 0;
        callback(m_packet->data, m_packet->size, m_packet->pts, is_key);
        
        av_packet_unref(m_packet);
    }
    return true;
}
```

### Encoder auto-detection
```cpp
// encode/EncoderFactory.hpp

static std::unique_ptr<H264Encoder> create_best_encoder() {
    // Priority: NVENC > QSV > x264
    
    const AVCodec* nvenc = avcodec_find_encoder_by_name("h264_nvenc");
    if (nvenc) {
        auto enc = std::make_unique<FFmpegH264Encoder>(nvenc);
        if (enc->test_encode()) {  // dry run to verify GPU works
            spdlog::info("Using NVENC hardware encoder");
            return enc;
        }
    }
    
    const AVCodec* qsv = avcodec_find_encoder_by_name("h264_qsv");
    if (qsv) {
        auto enc = std::make_unique<FFmpegH264Encoder>(qsv);
        if (enc->test_encode()) {
            spdlog::info("Using QSV hardware encoder");
            return enc;
        }
    }
    
    // Fallback: always works
    const AVCodec* x264 = avcodec_find_encoder_by_name("libx264");
    spdlog::warn("Using x264 software encoder (CPU intensive)");
    return std::make_unique<FFmpegH264Encoder>(x264);
}
```

### NVENC-specific settings (low latency)
```cpp
// For NVENC: optimize for screen capture low-latency
av_opt_set(m_ctx->priv_data, "preset", "p1", 0);      // fastest preset
av_opt_set(m_ctx->priv_data, "tune", "ll", 0);         // low latency
av_opt_set(m_ctx->priv_data, "rc", "cbr", 0);          // constant bitrate
av_opt_set_int(m_ctx->priv_data, "zerolatency", 1, 0); // no B-frames, no lookahead
av_opt_set_int(m_ctx->priv_data, "delay", 0, 0);       // minimize encode delay
m_ctx->max_b_frames = 0;                                // no B-frames for RTC
m_ctx->gop_size = 60;                                   // keyframe every 4s @15fps
m_ctx->thread_count = 1;                                // single thread for NVENC
```

### x264-specific settings (CPU fallback)
```cpp
// For x264: ultrafast zerolatency
av_opt_set(m_ctx->priv_data, "preset", "ultrafast", 0);
av_opt_set(m_ctx->priv_data, "tune", "zerolatency", 0);
m_ctx->max_b_frames = 0;
m_ctx->gop_size = 60;
m_ctx->thread_count = 2;  // use 2 threads for x264
```

---

## 6. WEBRTC PRODUCER (libdatachannel)

### Interface
```cpp
// webrtc/WebRtcProducer.hpp
#pragma once
#include <string>
#include <functional>
#include <memory>
#include <rtc/rtc.hpp>  // libdatachannel

namespace hub32::agent {

struct ProducerConfig {
    std::string server_url;       // hub32api URL
    std::string auth_token;       // JWT agent token
    std::string location_id;      // room this agent belongs to
    std::string stun_url;         // "stun:stun.l.google.com:19302"
    std::string turn_url;         // "turns:turn.hub32.example.com:443"
    std::string turn_username;    // HMAC time-limited
    std::string turn_credential;  // HMAC time-limited
};

enum class ProducerState {
    Disconnected,
    Connecting,
    Connected,
    Reconnecting,
    Failed,
};

using StateCallback = std::function<void(ProducerState)>;

class WebRtcProducer {
public:
    WebRtcProducer();
    ~WebRtcProducer();
    
    // Initialize: create PeerConnection, get ICE servers, setup DTLS
    bool initialize(const ProducerConfig& config);
    
    // Start producing: create transport → connect → produce
    bool start();
    
    // Send encoded H.264 data as RTP
    bool send_h264(const uint8_t* data, size_t size, 
                   int64_t timestamp, bool is_keyframe);
    
    // Stop producing, cleanup
    void stop();
    
    // State monitoring
    ProducerState state() const;
    void on_state_change(StateCallback cb);
    
    // Force reconnect (called on network change)
    void reconnect();
    
private:
    struct Impl;
    std::unique_ptr<Impl> m_impl;
};

} // namespace hub32::agent
```

### Signaling flow (REST-based, no WebSocket needed)
```cpp
// webrtc/SignalingClient.hpp

class SignalingClient {
public:
    SignalingClient(const std::string& server_url, const std::string& token);
    
    // Step 1: Get ICE servers (STUN + TURN with time-limited credentials)
    Result<std::vector<IceServer>> get_ice_servers();
    
    // Step 2: Get router RTP capabilities from SFU
    Result<nlohmann::json> get_router_capabilities();
    
    // Step 3: Create server-side transport
    Result<TransportInfo> create_transport(const std::string& location_id, 
                                           const std::string& direction);
    
    // Step 4: Connect transport (DTLS handshake)
    Result<void> connect_transport(const std::string& transport_id,
                                   const nlohmann::json& dtls_params);
    
    // Step 5: Create producer
    Result<std::string> produce(const std::string& transport_id,
                                const std::string& kind,
                                const nlohmann::json& rtp_params);
    
    // Cleanup
    Result<void> close_transport(const std::string& transport_id);
};
```

### libdatachannel WebRTC setup
```cpp
// webrtc/WebRtcProducer.cpp — connection setup

bool WebRtcProducer::Impl::setup_peer_connection() {
    rtc::Configuration config;
    
    // Add ICE servers
    config.iceServers.push_back(
        rtc::IceServer(m_config.stun_url));
    config.iceServers.push_back(
        rtc::IceServer(m_config.turn_url, 
                       m_config.turn_username, 
                       m_config.turn_credential));
    
    // Create PeerConnection
    m_pc = std::make_shared<rtc::PeerConnection>(config);
    
    // State change handler
    m_pc->onStateChange([this](rtc::PeerConnection::State state) {
        switch (state) {
            case rtc::PeerConnection::State::Connected:
                set_state(ProducerState::Connected);
                break;
            case rtc::PeerConnection::State::Disconnected:
                set_state(ProducerState::Reconnecting);
                schedule_reconnect(3000);  // retry in 3s
                break;
            case rtc::PeerConnection::State::Failed:
                set_state(ProducerState::Failed);
                schedule_reconnect(5000);  // retry in 5s
                break;
            default: break;
        }
    });
    
    // Create H.264 video track
    rtc::Description::Video media("video", rtc::Description::Direction::SendOnly);
    media.addH264Codec(96);  // payload type 96
    media.addSSRC(m_ssrc, "hub32-agent");
    
    m_track = m_pc->addTrack(media);
    
    // Setup RTP config for H.264
    auto rtp_config = std::make_shared<rtc::RtpPacketizationConfig>(
        m_ssrc, "hub32-agent", 96, rtc::H264RtpPacketizer::defaultClockRate);
    
    auto packetizer = std::make_shared<rtc::H264RtpPacketizer>(
        rtc::NalUnit::Separator::LongStartSequence, rtp_config);
    
    m_track->setMediaHandler(packetizer);
    
    return true;
}
```

### Sending H.264 frames
```cpp
bool WebRtcProducer::send_h264(const uint8_t* data, size_t size, 
                                int64_t timestamp, bool is_keyframe) {
    if (!m_impl->m_track || !m_impl->m_track->isOpen()) {
        return false;
    }
    
    // libdatachannel handles RTP packetization of H.264 NAL units
    // Just send the raw H.264 Annex B data
    auto bytes = reinterpret_cast<const std::byte*>(data);
    m_impl->m_track->send(bytes, size);
    
    return true;
}
```

### Auto-reconnect logic
```cpp
void WebRtcProducer::Impl::schedule_reconnect(int delay_ms) {
    if (m_reconnect_count >= kMaxReconnectAttempts) {
        spdlog::error("WebRTC: max reconnect attempts reached");
        set_state(ProducerState::Failed);
        return;
    }
    
    m_reconnect_count++;
    spdlog::warn("WebRTC: reconnecting in {}ms (attempt {}/{})", 
                 delay_ms, m_reconnect_count, kMaxReconnectAttempts);
    
    std::this_thread::sleep_for(std::chrono::milliseconds(delay_ms));
    
    // Cleanup old connection
    m_track.reset();
    m_pc.reset();
    
    // Re-fetch TURN credentials (they expire)
    auto ice_result = m_signaling.get_ice_servers();
    if (ice_result.is_ok()) {
        // Update TURN credentials
        // Re-create PeerConnection
        setup_peer_connection();
        start_producing();
    }
}

constexpr int kMaxReconnectAttempts = 10;
constexpr int kReconnectBackoffMs[] = { 1000, 2000, 3000, 5000, 5000, 10000, 10000, 30000, 30000, 60000 };
```

---

## 7. STREAM PIPELINE (Orchestrator)

```cpp
// pipeline/StreamPipeline.hpp
#pragma once
#include <atomic>
#include <thread>
#include <memory>

namespace hub32::agent {

class DxgiCapture;
class ColorConverter;
class H264Encoder;
class WebRtcProducer;

struct PipelineConfig {
    int capture_fps = 15;             // frames per second
    int width = 1280;                 // capture width (can be downscaled)
    int height = 720;                 // capture height
    int bitrate_kbps = 2500;          // H.264 bitrate
    std::string server_url;           // hub32api URL
    std::string auth_token;           // JWT token
    std::string location_id;          // room ID
};

class StreamPipeline {
public:
    StreamPipeline();
    ~StreamPipeline();
    
    bool initialize(const PipelineConfig& config);
    void start();   // starts capture loop in separate thread
    void stop();    // signals stop, joins thread
    
    bool is_running() const;
    
private:
    void capture_loop();   // main loop: capture → convert → encode → send
    
    std::unique_ptr<DxgiCapture>     m_capture;
    std::unique_ptr<ColorConverter>  m_converter;
    std::unique_ptr<H264Encoder>     m_encoder;
    std::unique_ptr<WebRtcProducer>  m_producer;
    
    std::thread      m_thread;
    std::atomic<bool> m_running{false};
    PipelineConfig   m_config;
    int64_t          m_frame_count = 0;
};

} // namespace hub32::agent
```

### Main capture loop
```cpp
void StreamPipeline::capture_loop() {
    const auto frame_interval = std::chrono::microseconds(1'000'000 / m_config.capture_fps);
    
    // Pre-allocate NV12 buffer
    const int nv12_size = m_config.width * m_config.height * 3 / 2;
    std::vector<uint8_t> nv12_buffer(nv12_size);
    uint8_t* nv12_y  = nv12_buffer.data();
    uint8_t* nv12_uv = nv12_y + m_config.width * m_config.height;
    
    while (m_running) {
        auto frame_start = std::chrono::steady_clock::now();
        
        // 1. Capture BGRA frame from DXGI
        auto* bgra = m_capture->acquire_frame();  // returns pointer to BGRA data
        if (!bgra) {
            std::this_thread::sleep_for(std::chrono::milliseconds(1));
            continue;
        }
        
        // 2. Convert BGRA → NV12
        m_converter->convert(
            bgra, m_config.width * 4,      // BGRA stride
            nv12_y, m_config.width,         // Y stride
            nv12_uv, m_config.width,        // UV stride
            m_config.width, m_config.height
        );
        
        m_capture->release_frame();
        
        // 3. Encode NV12 → H.264
        m_encoder->encode(
            nv12_y, m_config.width,
            nv12_uv, m_config.width,
            m_frame_count++,
            [this](const uint8_t* data, size_t size, int64_t pts, bool is_key) {
                // 4. Send H.264 via WebRTC
                m_producer->send_h264(data, size, pts, is_key);
            }
        );
        
        // 5. Rate limiting: sleep to maintain target FPS
        auto elapsed = std::chrono::steady_clock::now() - frame_start;
        if (elapsed < frame_interval) {
            std::this_thread::sleep_for(frame_interval - elapsed);
        }
    }
}
```

---

## 8. CMAKE INTEGRATION

### Thêm vào agent/CMakeLists.txt
```cmake
# FFmpeg
find_package(PkgConfig REQUIRED)
pkg_check_modules(FFMPEG REQUIRED
    libavcodec
    libavutil
    libswscale
)

# libdatachannel
include(FetchContent)
FetchContent_Declare(
    libdatachannel
    GIT_REPOSITORY https://github.com/paullouisageneau/libdatachannel.git
    GIT_TAG        v0.22.2  # pin stable version
)
set(NO_WEBSOCKET ON CACHE BOOL "" FORCE)    # don't need WebSocket
set(NO_EXAMPLES ON CACHE BOOL "" FORCE)
set(NO_TESTS ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(libdatachannel)

# libyuv (optional fallback)
FetchContent_Declare(
    libyuv
    GIT_REPOSITORY https://chromium.googlesource.com/libyuv/libyuv
    GIT_TAG        main
)
FetchContent_MakeAvailable(libyuv)

# Agent target
target_sources(hub32-agent PRIVATE
    src/encode/ColorConverter.cpp
    src/encode/H264Encoder.cpp
    src/webrtc/WebRtcProducer.cpp
    src/webrtc/SignalingClient.cpp
    src/webrtc/RtpPacketizer.cpp
    src/pipeline/StreamPipeline.cpp
)

target_link_libraries(hub32-agent PRIVATE
    ${FFMPEG_LIBRARIES}
    LibDataChannel::LibDataChannelStatic
    yuv
)

target_include_directories(hub32-agent PRIVATE
    ${FFMPEG_INCLUDE_DIRS}
)
```

### vcpkg.json additions
```json
{
  "dependencies": [
    "ffmpeg[nvcodec,x264,qsv]",
    "libyuv"
  ]
}
```

---

## 9. SIMULCAST IMPLEMENTATION

### Strategy
Agent encodes 3 quality layers independently. SFU forwards selected layer to each teacher.

```
Layer 0 (thumbnail):  320x180   @ 10fps  150kbps   — grid view
Layer 1 (medium):     640x360   @ 15fps  500kbps   — hover preview
Layer 2 (full):       1280x720  @ 15fps  2500kbps  — fullscreen view
```

### Implementation approach
```
Option A (recommended): Single capture → 3 encoders
  DXGI 1920x1080 → downscale to 3 resolutions → 3 H264Encoder instances
  Each encoder → separate RTP SSRC on same WebRTC transport
  Pro: SFU sees 3 simulcast layers natively
  Con: 3x encode overhead (mitigated by NVENC which handles 3 sessions easily)

Option B: Single encode → SFU temporal layer
  DXGI → single 720p encode → SFU manages layers via SVC
  Pro: 1x encode
  Con: Less control, needs SVC support in encoder
```

### Adaptive bitrate
```cpp
// Monitor RTCP feedback from SFU
// If packet loss > 5% → reduce bitrate by 20%
// If packet loss < 1% for 10s → increase bitrate by 10%
// Never exceed layer max bitrate

void StreamPipeline::on_rtcp_feedback(float packet_loss_percent) {
    if (packet_loss_percent > 5.0f) {
        int new_bitrate = m_current_bitrate * 0.8;
        new_bitrate = std::max(new_bitrate, 100);  // floor: 100kbps
        m_encoder->set_bitrate(new_bitrate);
        spdlog::warn("Reducing bitrate to {}kbps (loss: {:.1f}%)", 
                     new_bitrate, packet_loss_percent);
    } else if (packet_loss_percent < 1.0f && m_stable_count++ > 10) {
        int new_bitrate = m_current_bitrate * 1.1;
        new_bitrate = std::min(new_bitrate, m_config.bitrate_kbps);
        m_encoder->set_bitrate(new_bitrate);
        m_stable_count = 0;
    }
}
```

---

## 10. IMPLEMENTATION ORDER

Claude Code PHẢI thực hiện theo thứ tự. Build + test sau mỗi step.

```
Phase 4 (Encode):

Step 1: CMake setup
  - Add FFmpeg, libyuv dependencies
  - Verify build compiles with new deps
  
Step 2: ColorConverter
  - Implement libyuv CPU path first (always works)
  - Unit test: convert known BGRA → verify NV12 output
  
Step 3: H264Encoder with x264
  - Implement x264 (CPU) encoder first (always available)
  - Unit test: encode 10 NV12 frames → verify H.264 output
  
Step 4: EncoderFactory + NVENC/QSV
  - Add NVENC detection and initialization
  - Add QSV detection and initialization
  - Fallback chain: NVENC → QSV → x264
  - Test on machine with NVIDIA GPU

Step 5: D3D11 ColorConverter (GPU path)
  - Implement compute shader BGRA→NV12
  - Only if NVENC available (no point GPU convert → CPU encode)

Phase 5 (WebRTC):

Step 6: SignalingClient
  - REST calls to hub32api for transport/produce/consume
  - Unit test with mock HTTP server

Step 7: WebRtcProducer
  - libdatachannel PeerConnection setup
  - H.264 track creation
  - DTLS handshake via signaling

Step 8: StreamPipeline
  - Wire: DxgiCapture → ColorConverter → H264Encoder → WebRtcProducer
  - Capture loop with FPS limiter
  - Integration test: capture 5 seconds of desktop

Step 9: Reconnection
  - Auto-reconnect on disconnect/failure
  - TURN credential refresh
  - Exponential backoff

Step 10: Simulcast (if time permits)
  - 3 encoder instances at different resolutions
  - 3 RTP tracks on same transport
```

---

## 11. TESTING STRATEGY

```
Unit tests:
  - ColorConverter: BGRA→NV12 pixel accuracy
  - H264Encoder: encode→decode roundtrip (verify valid H.264)
  - SignalingClient: mock HTTP responses
  - RtpPacketizer: verify RTP header format

Integration tests:
  - Pipeline: capture 5s desktop → encode → save to file → verify playback
  - WebRTC: connect to local SFU → produce 10s → verify consumer receives

Performance benchmarks:
  - Measure: capture latency, encode latency, total pipeline latency
  - Target: < 100ms total (capture + encode + network)
  - NVENC target: < 50ms total
  - Log: CPU usage, GPU usage, memory, bandwidth
```

---

## 12. REFERENCES

```
FFmpeg libavcodec:
  https://ffmpeg.org/doxygen/trunk/group__lavc__encdec.html
  
NVIDIA NVENC:
  https://docs.nvidia.com/video-technologies/video-codec-sdk/13.0/ffmpeg-with-nvidia-gpu/
  
libdatachannel:
  https://libdatachannel.org/
  https://github.com/paullouisageneau/libdatachannel
  
libdatachannel H.264 streaming example:
  https://github.com/paullouisageneau/libdatachannel/tree/master/examples/streamer

DXGI Desktop Duplication:
  https://learn.microsoft.com/en-us/windows/win32/direct3ddxgi/desktop-dup-api
  
libyuv:
  https://chromium.googlesource.com/libyuv/libyuv
  
mediasoup signaling (server side, for understanding flow):
  https://mediasoup.org/documentation/v3/mediasoup/api/
```
