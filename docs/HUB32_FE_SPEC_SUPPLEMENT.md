# HUB32 FE Spec — BỔ SUNG: Utils, Styles, i18n, Shared Components
# Append vào HUB32_FE_SPEC.md hoặc đặt riêng tại docs/fe-spec-supplement.md
# Version: 1.0 | Date: 2026-03-26

---

## 14. I18N — FULL INTERNATIONALIZATION

### 14.1. Setup
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### 14.2. Folder structure
```
src/
├── i18n/
│   ├── index.ts              # i18next init + config
│   ├── locales/
│   │   ├── vi.json            # Tiếng Việt (default)
│   │   ├── en.json            # English
│   │   └── zh.json            # 中文
│   └── types.ts               # Type-safe translation keys
```

### 14.3. Config (src/i18n/index.ts)
```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import vi from "./locales/vi.json";
import en from "./locales/en.json";
import zh from "./locales/zh.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
      zh: { translation: zh },
    },
    fallbackLng: "vi",           // Vietnamese default
    supportedLngs: ["vi", "en", "zh"],
    interpolation: {
      escapeValue: false,        // React already escapes
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "hub32_lang",
    },
  });

export default i18n;
```

### 14.4. Translation files

**QUY TẮC BẮT BUỘC:**
- MỌI text hiển thị cho user PHẢI qua `t()` function. KHÔNG hardcode string.
- Key dùng dot notation, group theo feature: `auth.login`, `grid.selectAll`
- Placeholder dùng `{{variable}}` syntax
- Plurals dùng `_one` / `_other` suffix

**src/i18n/locales/vi.json:**
```json
{
  "app": {
    "name": "HUB32",
    "title": "Quản lý phòng máy",
    "loading": "Đang tải...",
    "error": "Đã xảy ra lỗi",
    "retry": "Thử lại",
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "edit": "Sửa",
    "create": "Tạo mới",
    "search": "Tìm kiếm...",
    "confirm": "Xác nhận",
    "close": "Đóng",
    "yes": "Có",
    "no": "Không",
    "back": "Quay lại",
    "noData": "Không có dữ liệu",
    "copiedToClipboard": "Đã sao chép"
  },

  "auth": {
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "username": "Tên đăng nhập",
    "password": "Mật khẩu",
    "loginButton": "Đăng nhập",
    "loggingIn": "Đang đăng nhập...",
    "logoutConfirm": "Bạn có chắc muốn đăng xuất?",
    "error": {
      "invalidCredentials": "Sai tên đăng nhập hoặc mật khẩu",
      "tooManyAttempts": "Quá nhiều lần thử, vui lòng đợi {{seconds}} giây",
      "networkError": "Không thể kết nối server",
      "tokenExpired": "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại",
      "unauthorized": "Bạn không có quyền truy cập"
    }
  },

  "sidebar": {
    "rooms": "Phòng máy",
    "allRooms": "Tất cả phòng",
    "online": "{{count}} trực tuyến",
    "offline": "{{count}} ngoại tuyến",
    "noRooms": "Chưa được gán phòng máy nào",
    "admin": "Quản trị"
  },

  "header": {
    "role": {
      "admin": "Quản trị viên",
      "teacher": "Giáo viên",
      "readonly": "Chỉ xem"
    },
    "language": "Ngôn ngữ",
    "settings": "Cài đặt"
  },

  "grid": {
    "selectAll": "Chọn tất cả",
    "deselectAll": "Bỏ chọn tất cả",
    "selected": "Đã chọn {{count}} máy",
    "noComputers": "Phòng này chưa có máy tính nào",
    "computerCount_one": "{{count}} máy tính",
    "computerCount_other": "{{count}} máy tính",
    "zoomIn": "Phóng to",
    "zoomOut": "Thu nhỏ",
    "refresh": "Làm mới"
  },

  "computer": {
    "state": {
      "online": "Trực tuyến",
      "offline": "Ngoại tuyến",
      "connected": "Đã kết nối",
      "connecting": "Đang kết nối",
      "disconnecting": "Đang ngắt",
      "unknown": "Không rõ",
      "locked": "Đã khóa"
    },
    "info": {
      "hostname": "Tên máy",
      "ipAddress": "Địa chỉ IP",
      "user": "Người dùng",
      "uptime": "Thời gian hoạt động",
      "session": "Phiên làm việc",
      "agentVersion": "Phiên bản Agent",
      "lastSeen": "Lần cuối trực tuyến",
      "resolution": "Độ phân giải"
    }
  },

  "feature": {
    "toolbar": "Công cụ điều khiển",
    "lock": {
      "title": "Khóa màn hình",
      "lock": "Khóa",
      "unlock": "Mở khóa",
      "confirmLock": "Khóa màn hình {{count}} máy tính?",
      "confirmUnlock": "Mở khóa {{count}} máy tính?",
      "success": "Đã khóa {{count}} máy",
      "unlockSuccess": "Đã mở khóa {{count}} máy"
    },
    "message": {
      "title": "Gửi tin nhắn",
      "placeholder": "Nhập nội dung tin nhắn...",
      "send": "Gửi",
      "success": "Đã gửi tin nhắn tới {{count}} máy"
    },
    "power": {
      "title": "Điều khiển nguồn",
      "shutdown": "Tắt máy",
      "reboot": "Khởi động lại",
      "logoff": "Đăng xuất",
      "confirmShutdown": "Tắt {{count}} máy tính? Dữ liệu chưa lưu sẽ bị mất.",
      "confirmReboot": "Khởi động lại {{count}} máy tính?",
      "confirmLogoff": "Đăng xuất người dùng trên {{count}} máy tính?",
      "success": "Đã gửi lệnh {{action}} tới {{count}} máy"
    },
    "demo": {
      "title": "Trình chiếu",
      "start": "Bắt đầu trình chiếu",
      "stop": "Dừng trình chiếu",
      "broadcasting": "Đang trình chiếu tới {{count}} máy",
      "selectScreen": "Chọn màn hình để chia sẻ"
    },
    "inputLock": {
      "title": "Khóa chuột & bàn phím",
      "lock": "Khóa input",
      "unlock": "Mở input"
    }
  },

  "admin": {
    "title": "Quản trị hệ thống",
    "tabs": {
      "schools": "Trường học",
      "locations": "Phòng máy",
      "teachers": "Giáo viên",
      "audit": "Nhật ký"
    },
    "school": {
      "name": "Tên trường",
      "address": "Địa chỉ",
      "createTitle": "Thêm trường mới",
      "editTitle": "Sửa thông tin trường",
      "deleteConfirm": "Xóa trường \"{{name}}\"? Tất cả phòng máy và dữ liệu liên quan sẽ bị xóa."
    },
    "location": {
      "name": "Tên phòng",
      "building": "Tòa nhà",
      "floor": "Tầng",
      "capacity": "Sức chứa",
      "type": "Loại",
      "types": {
        "classroom": "Phòng học",
        "lab": "Phòng thí nghiệm",
        "office": "Văn phòng"
      },
      "createTitle": "Thêm phòng mới",
      "editTitle": "Sửa thông tin phòng",
      "deleteConfirm": "Xóa phòng \"{{name}}\"?"
    },
    "teacher": {
      "username": "Tên đăng nhập",
      "fullName": "Họ và tên",
      "role": "Vai trò",
      "password": "Mật khẩu",
      "assignedRooms": "Phòng được gán",
      "assignRoom": "Gán phòng",
      "removeRoom": "Bỏ gán phòng",
      "createTitle": "Thêm giáo viên",
      "editTitle": "Sửa thông tin giáo viên",
      "deleteConfirm": "Xóa giáo viên \"{{name}}\"?"
    },
    "audit": {
      "timestamp": "Thời gian",
      "teacher": "Giáo viên",
      "action": "Hành động",
      "target": "Đối tượng",
      "details": "Chi tiết",
      "ipAddress": "Địa chỉ IP",
      "filterByDate": "Lọc theo ngày",
      "filterByAction": "Lọc theo hành động",
      "filterByTeacher": "Lọc theo giáo viên"
    }
  },

  "stream": {
    "connecting": "Đang kết nối stream...",
    "connected": "Đã kết nối",
    "disconnected": "Mất kết nối stream",
    "reconnecting": "Đang kết nối lại...",
    "failed": "Không thể kết nối",
    "noStream": "Chưa có stream"
  },

  "time": {
    "justNow": "Vừa xong",
    "minutesAgo": "{{count}} phút trước",
    "hoursAgo": "{{count}} giờ trước",
    "daysAgo": "{{count}} ngày trước",
    "seconds": "giây",
    "minutes": "phút",
    "hours": "giờ",
    "days": "ngày"
  },

  "validation": {
    "required": "Trường này là bắt buộc",
    "minLength": "Tối thiểu {{min}} ký tự",
    "maxLength": "Tối đa {{max}} ký tự",
    "invalidEmail": "Email không hợp lệ",
    "invalidUsername": "Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới",
    "passwordTooWeak": "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số"
  }
}
```

**src/i18n/locales/en.json:**
```json
{
  "app": {
    "name": "HUB32",
    "title": "Computer Lab Management",
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search...",
    "confirm": "Confirm",
    "close": "Close",
    "yes": "Yes",
    "no": "No",
    "back": "Back",
    "noData": "No data",
    "copiedToClipboard": "Copied to clipboard"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "username": "Username",
    "password": "Password",
    "loginButton": "Sign in",
    "loggingIn": "Signing in...",
    "logoutConfirm": "Are you sure you want to logout?",
    "error": {
      "invalidCredentials": "Invalid username or password",
      "tooManyAttempts": "Too many attempts, please wait {{seconds}} seconds",
      "networkError": "Cannot connect to server",
      "tokenExpired": "Session expired, please login again",
      "unauthorized": "You don't have permission"
    }
  },
  "sidebar": {
    "rooms": "Rooms",
    "allRooms": "All rooms",
    "online": "{{count}} online",
    "offline": "{{count}} offline",
    "noRooms": "No rooms assigned",
    "admin": "Administration"
  },
  "header": {
    "role": {
      "admin": "Administrator",
      "teacher": "Teacher",
      "readonly": "Read-only"
    },
    "language": "Language",
    "settings": "Settings"
  },
  "grid": {
    "selectAll": "Select all",
    "deselectAll": "Deselect all",
    "selected": "{{count}} selected",
    "noComputers": "No computers in this room",
    "computerCount_one": "{{count}} computer",
    "computerCount_other": "{{count}} computers",
    "zoomIn": "Zoom in",
    "zoomOut": "Zoom out",
    "refresh": "Refresh"
  },
  "computer": {
    "state": {
      "online": "Online",
      "offline": "Offline",
      "connected": "Connected",
      "connecting": "Connecting",
      "disconnecting": "Disconnecting",
      "unknown": "Unknown",
      "locked": "Locked"
    },
    "info": {
      "hostname": "Hostname",
      "ipAddress": "IP Address",
      "user": "User",
      "uptime": "Uptime",
      "session": "Session",
      "agentVersion": "Agent version",
      "lastSeen": "Last seen",
      "resolution": "Resolution"
    }
  },
  "feature": {
    "toolbar": "Controls",
    "lock": {
      "title": "Lock Screen",
      "lock": "Lock",
      "unlock": "Unlock",
      "confirmLock": "Lock {{count}} computers?",
      "confirmUnlock": "Unlock {{count}} computers?",
      "success": "Locked {{count}} computers",
      "unlockSuccess": "Unlocked {{count}} computers"
    },
    "message": {
      "title": "Send Message",
      "placeholder": "Type your message...",
      "send": "Send",
      "success": "Message sent to {{count}} computers"
    },
    "power": {
      "title": "Power Control",
      "shutdown": "Shut down",
      "reboot": "Restart",
      "logoff": "Log off",
      "confirmShutdown": "Shut down {{count}} computers? Unsaved data will be lost.",
      "confirmReboot": "Restart {{count}} computers?",
      "confirmLogoff": "Log off users on {{count}} computers?",
      "success": "{{action}} command sent to {{count}} computers"
    },
    "demo": {
      "title": "Screen Broadcast",
      "start": "Start broadcasting",
      "stop": "Stop broadcasting",
      "broadcasting": "Broadcasting to {{count}} computers",
      "selectScreen": "Select screen to share"
    },
    "inputLock": {
      "title": "Lock Mouse & Keyboard",
      "lock": "Lock input",
      "unlock": "Unlock input"
    }
  },
  "admin": {
    "title": "System Administration",
    "tabs": {
      "schools": "Schools",
      "locations": "Rooms",
      "teachers": "Teachers",
      "audit": "Audit Log"
    },
    "school": {
      "name": "School name",
      "address": "Address",
      "createTitle": "Add School",
      "editTitle": "Edit School",
      "deleteConfirm": "Delete \"{{name}}\"? All rooms and related data will be removed."
    },
    "location": {
      "name": "Room name",
      "building": "Building",
      "floor": "Floor",
      "capacity": "Capacity",
      "type": "Type",
      "types": { "classroom": "Classroom", "lab": "Laboratory", "office": "Office" },
      "createTitle": "Add Room",
      "editTitle": "Edit Room",
      "deleteConfirm": "Delete room \"{{name}}\"?"
    },
    "teacher": {
      "username": "Username",
      "fullName": "Full name",
      "role": "Role",
      "password": "Password",
      "assignedRooms": "Assigned rooms",
      "assignRoom": "Assign room",
      "removeRoom": "Remove room",
      "createTitle": "Add Teacher",
      "editTitle": "Edit Teacher",
      "deleteConfirm": "Delete teacher \"{{name}}\"?"
    },
    "audit": {
      "timestamp": "Time",
      "teacher": "Teacher",
      "action": "Action",
      "target": "Target",
      "details": "Details",
      "ipAddress": "IP Address",
      "filterByDate": "Filter by date",
      "filterByAction": "Filter by action",
      "filterByTeacher": "Filter by teacher"
    }
  },
  "stream": {
    "connecting": "Connecting stream...",
    "connected": "Connected",
    "disconnected": "Stream disconnected",
    "reconnecting": "Reconnecting...",
    "failed": "Connection failed",
    "noStream": "No stream available"
  },
  "time": {
    "justNow": "Just now",
    "minutesAgo": "{{count}} min ago",
    "hoursAgo": "{{count}} hr ago",
    "daysAgo": "{{count}} days ago",
    "seconds": "seconds",
    "minutes": "minutes",
    "hours": "hours",
    "days": "days"
  },
  "validation": {
    "required": "This field is required",
    "minLength": "Minimum {{min}} characters",
    "maxLength": "Maximum {{max}} characters",
    "invalidEmail": "Invalid email",
    "invalidUsername": "Username can only contain letters, numbers and underscores",
    "passwordTooWeak": "Password must be at least 8 characters with uppercase, lowercase and numbers"
  }
}
```

**src/i18n/locales/zh.json:**
```json
{
  "app": {
    "name": "HUB32",
    "title": "计算机教室管理",
    "loading": "加载中...",
    "error": "发生错误",
    "retry": "重试",
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "create": "新建",
    "search": "搜索...",
    "confirm": "确认",
    "close": "关闭",
    "yes": "是",
    "no": "否",
    "back": "返回",
    "noData": "暂无数据",
    "copiedToClipboard": "已复制"
  },
  "auth": {
    "login": "登录",
    "logout": "退出登录",
    "username": "用户名",
    "password": "密码",
    "loginButton": "登录",
    "loggingIn": "登录中...",
    "logoutConfirm": "确定退出登录？",
    "error": {
      "invalidCredentials": "用户名或密码错误",
      "tooManyAttempts": "尝试次数过多，请等待{{seconds}}秒",
      "networkError": "无法连接服务器",
      "tokenExpired": "登录已过期，请重新登录",
      "unauthorized": "您没有访问权限"
    }
  },
  "sidebar": {
    "rooms": "教室",
    "allRooms": "所有教室",
    "online": "{{count}}台在线",
    "offline": "{{count}}台离线",
    "noRooms": "未分配教室",
    "admin": "管理"
  },
  "header": {
    "role": { "admin": "管理员", "teacher": "教师", "readonly": "只读" },
    "language": "语言",
    "settings": "设置"
  },
  "grid": {
    "selectAll": "全选",
    "deselectAll": "取消全选",
    "selected": "已选{{count}}台",
    "noComputers": "该教室暂无电脑",
    "computerCount_one": "{{count}}台电脑",
    "computerCount_other": "{{count}}台电脑",
    "zoomIn": "放大",
    "zoomOut": "缩小",
    "refresh": "刷新"
  },
  "computer": {
    "state": {
      "online": "在线", "offline": "离线", "connected": "已连接",
      "connecting": "连接中", "disconnecting": "断开中",
      "unknown": "未知", "locked": "已锁定"
    },
    "info": {
      "hostname": "主机名", "ipAddress": "IP地址", "user": "用户",
      "uptime": "运行时间", "session": "会话", "agentVersion": "Agent版本",
      "lastSeen": "最后在线", "resolution": "分辨率"
    }
  },
  "feature": {
    "toolbar": "控制面板",
    "lock": {
      "title": "锁屏", "lock": "锁定", "unlock": "解锁",
      "confirmLock": "锁定{{count}}台电脑？",
      "confirmUnlock": "解锁{{count}}台电脑？",
      "success": "已锁定{{count}}台", "unlockSuccess": "已解锁{{count}}台"
    },
    "message": {
      "title": "发送消息", "placeholder": "输入消息内容...",
      "send": "发送", "success": "已发送至{{count}}台电脑"
    },
    "power": {
      "title": "电源控制", "shutdown": "关机", "reboot": "重启", "logoff": "注销",
      "confirmShutdown": "关闭{{count}}台电脑？未保存数据将丢失。",
      "confirmReboot": "重启{{count}}台电脑？",
      "confirmLogoff": "注销{{count}}台电脑上的用户？",
      "success": "已向{{count}}台电脑发送{{action}}指令"
    },
    "demo": {
      "title": "屏幕广播", "start": "开始广播", "stop": "停止广播",
      "broadcasting": "正在向{{count}}台电脑广播", "selectScreen": "选择要共享的屏幕"
    },
    "inputLock": { "title": "锁定鼠标键盘", "lock": "锁定输入", "unlock": "解锁输入" }
  },
  "admin": {
    "title": "系统管理",
    "tabs": { "schools": "学校", "locations": "教室", "teachers": "教师", "audit": "日志" },
    "school": { "name": "学校名称", "address": "地址", "createTitle": "添加学校", "editTitle": "编辑学校", "deleteConfirm": "删除\"{{name}}\"？所有教室和相关数据将被删除。" },
    "location": { "name": "教室名称", "building": "楼栋", "floor": "楼层", "capacity": "容量", "type": "类型", "types": { "classroom": "教室", "lab": "实验室", "office": "办公室" }, "createTitle": "添加教室", "editTitle": "编辑教室", "deleteConfirm": "删除教室\"{{name}}\"？" },
    "teacher": { "username": "用户名", "fullName": "姓名", "role": "角色", "password": "密码", "assignedRooms": "分配教室", "assignRoom": "分配", "removeRoom": "移除", "createTitle": "添加教师", "editTitle": "编辑教师", "deleteConfirm": "删除教师\"{{name}}\"？" },
    "audit": { "timestamp": "时间", "teacher": "教师", "action": "操作", "target": "目标", "details": "详情", "ipAddress": "IP地址", "filterByDate": "按日期筛选", "filterByAction": "按操作筛选", "filterByTeacher": "按教师筛选" }
  },
  "stream": { "connecting": "正在连接...", "connected": "已连接", "disconnected": "连接断开", "reconnecting": "正在重连...", "failed": "连接失败", "noStream": "暂无画面" },
  "time": { "justNow": "刚刚", "minutesAgo": "{{count}}分钟前", "hoursAgo": "{{count}}小时前", "daysAgo": "{{count}}天前", "seconds": "秒", "minutes": "分钟", "hours": "小时", "days": "天" },
  "validation": { "required": "此项必填", "minLength": "最少{{min}}个字符", "maxLength": "最多{{max}}个字符", "invalidEmail": "邮箱格式无效", "invalidUsername": "用户名只能包含字母、数字和下划线", "passwordTooWeak": "密码至少8位，包含大小写字母和数字" }
}
```

### 14.5. Usage trong components
```typescript
// ĐÚNG — mọi text qua t()
import { useTranslation } from "react-i18next";

function LoginForm() {
  const { t } = useTranslation();
  return (
    <form>
      <Label>{t("auth.username")}</Label>
      <Input placeholder={t("auth.username")} />
      <Label>{t("auth.password")}</Label>
      <Input type="password" />
      <Button>{t("auth.loginButton")}</Button>
    </form>
  );
}

// SAI — KHÔNG BAO GIỜ hardcode
<Button>Đăng nhập</Button>   // ❌ FORBIDDEN
<Button>{t("auth.loginButton")}</Button>  // ✅ CORRECT
```

### 14.6. Language Switcher component
```
src/components/shared/LanguageSwitcher.tsx

Dropdown menu:
- 🇻🇳 Tiếng Việt
- 🇬🇧 English  
- 🇨🇳 中文

Lưu vào localStorage key "hub32_lang"
Đặt trong Header, cạnh user avatar
```

---

## 15. UTILS — HÀM TIỆN ÍCH CHUNG (src/lib/)

### 15.1. File structure
```
src/lib/
├── utils.ts              # General helpers
├── formatters.ts         # Date, number, filesize formatting
├── validators.ts         # Form validation helpers
├── keyboard.ts           # Keyboard shortcuts
├── clipboard.ts          # Copy to clipboard
├── cn.ts                 # classNames utility (shadcn pattern)
└── constants.ts          # FE-only constants
```

### 15.2. cn.ts — Class name utility (BẮT BUỘC cho shadcn/ui)
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn/ui standard pattern
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
```bash
npm install clsx tailwind-merge
```

### 15.3. formatters.ts
```typescript
import { TFunction } from "i18next";

// Relative time: "5 phút trước", "2 giờ trước"
export function formatRelativeTime(timestamp: number, t: TFunction): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60)   return t("time.justNow");
  if (diff < 3600) return t("time.minutesAgo", { count: Math.floor(diff / 60) });
  if (diff < 86400) return t("time.hoursAgo", { count: Math.floor(diff / 3600) });
  return t("time.daysAgo", { count: Math.floor(diff / 86400) });
}

// Uptime: "2h 15m 30s"
export function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// Date: "26/03/2026 14:30"
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

// Number: "1,234" 
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

// Bitrate: "2.5 Mbps"
export function formatBitrate(kbps: number): string {
  if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} Mbps`;
  return `${kbps} kbps`;
}

// IP address truncate for display
export function formatIp(ip: string, maxLen = 15): string {
  return ip.length > maxLen ? ip.slice(0, maxLen) + "…" : ip;
}
```

### 15.4. validators.ts
```typescript
export function isValidUsername(s: string): boolean {
  return /^[a-zA-Z0-9_]{3,64}$/.test(s);
}

export function isValidPassword(s: string): boolean {
  return s.length >= 8 && /[A-Z]/.test(s) && /[a-z]/.test(s) && /[0-9]/.test(s);
}

export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function isNotEmpty(s: string): boolean {
  return s.trim().length > 0;
}

export function isWithinLength(s: string, min: number, max: number): boolean {
  return s.length >= min && s.length <= max;
}

// Safe parseInt that never returns NaN
export function safeInt(s: string, fallback = 0): number {
  const n = parseInt(s, 10);
  return isNaN(n) ? fallback : n;
}
```

### 15.5. keyboard.ts
```typescript
import { useEffect } from "react";

type KeyHandler = (e: KeyboardEvent) => void;

// Global keyboard shortcut hook
export function useKeyboardShortcut(key: string, handler: KeyHandler, deps: any[] = []) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      // Ignore when typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === key) handler(e);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, deps);
}

// Shortcut definitions
export const SHORTCUTS = {
  ESCAPE: "Escape",         // Close modals, deselect
  SELECT_ALL: "a",          // Ctrl+A select all computers (with modifier check)
  LOCK: "l",                // Quick lock
  REFRESH: "r",             // Refresh grid
  SEARCH: "/",              // Focus search
} as const;
```

### 15.6. clipboard.ts
```typescript
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}
```

### 15.7. constants.ts (FE-only)
```typescript
// Refresh intervals
export const COMPUTER_POLL_MS = 5000;     // refresh computer list every 5s
export const HEARTBEAT_POLL_MS = 30000;   // check connection every 30s

// Grid layout
export const GRID_COLS_SM = 2;
export const GRID_COLS_MD = 3;
export const GRID_COLS_LG = 4;
export const GRID_COLS_XL = 6;

// Pagination
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

// Debounce
export const SEARCH_DEBOUNCE_MS = 300;

// Thumbnail aspect ratio
export const THUMBNAIL_RATIO = 16 / 9;

// Max simultaneous WebRTC consumers
export const MAX_CONSUMERS = 60;
```

---

## 16. STYLES — DESIGN SYSTEM (src/index.css)

### 16.1. CSS Variables đầy đủ
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

@layer base {
  :root {
    /* ---- Colors ---- */
    --bg-primary:       #0A0A0B;
    --bg-secondary:     #141416;
    --bg-tertiary:      #1C1C1F;
    --bg-elevated:      #222226;
    --bg-hover:         #2A2A2E;
    --bg-active:        #333338;

    --border-default:   #2A2A2E;
    --border-subtle:    #1F1F23;
    --border-strong:    #3A3A40;

    --text-primary:     #FAFAFA;
    --text-secondary:   #A0A0A8;
    --text-tertiary:    #6B6B73;
    --text-disabled:    #4A4A52;

    --accent:           #3B82F6;
    --accent-hover:     #2563EB;
    --accent-subtle:    rgba(59, 130, 246, 0.15);

    --success:          #22C55E;
    --success-subtle:   rgba(34, 197, 94, 0.15);
    --warning:          #F59E0B;
    --warning-subtle:   rgba(245, 158, 11, 0.15);
    --danger:           #EF4444;
    --danger-subtle:    rgba(239, 68, 68, 0.15);
    --info:             #06B6D4;
    --info-subtle:      rgba(6, 182, 212, 0.15);

    /* ---- Typography ---- */
    --font-sans:        "IBM Plex Sans", system-ui, sans-serif;
    --font-mono:        "JetBrains Mono", "Fira Code", ui-monospace, monospace;

    /* Type scale (modular, ratio 1.2) */
    --text-xs:    0.694rem;   /* 11.1px */
    --text-sm:    0.833rem;   /* 13.3px */
    --text-base:  1rem;       /* 16px */
    --text-lg:    1.2rem;     /* 19.2px */
    --text-xl:    1.44rem;    /* 23px */
    --text-2xl:   1.728rem;   /* 27.6px */
    --text-3xl:   2.074rem;   /* 33.2px */

    /* ---- Spacing (4px grid) ---- */
    --space-0:    0;
    --space-1:    0.25rem;    /* 4px */
    --space-2:    0.5rem;     /* 8px */
    --space-3:    0.75rem;    /* 12px */
    --space-4:    1rem;       /* 16px */
    --space-5:    1.25rem;    /* 20px */
    --space-6:    1.5rem;     /* 24px */
    --space-8:    2rem;       /* 32px */
    --space-10:   2.5rem;     /* 40px */
    --space-12:   3rem;       /* 48px */
    --space-16:   4rem;       /* 64px */

    /* ---- Border radius ---- */
    --radius-sm:   2px;
    --radius-md:   4px;
    --radius-lg:   6px;
    --radius-xl:   8px;
    --radius-full: 9999px;

    /* ---- Shadows ---- */
    --shadow-sm:    0 1px 2px rgba(0,0,0,0.4);
    --shadow-md:    0 2px 8px rgba(0,0,0,0.5);
    --shadow-lg:    0 4px 16px rgba(0,0,0,0.6);
    --shadow-glow:  0 0 12px rgba(59,130,246,0.3);

    /* ---- Z-index layers ---- */
    --z-base:       0;
    --z-dropdown:   100;
    --z-sticky:     200;
    --z-overlay:    300;
    --z-modal:      400;
    --z-popover:    500;
    --z-tooltip:    600;
    --z-toast:      700;

    /* ---- Transitions ---- */
    --duration-fast:    100ms;
    --duration-normal:  200ms;
    --duration-slow:    300ms;
    --ease-default:     cubic-bezier(0.4, 0, 0.2, 1);
    --ease-in:          cubic-bezier(0.4, 0, 1, 1);
    --ease-out:         cubic-bezier(0, 0, 0.2, 1);

    /* ---- Breakpoints (for reference, Tailwind handles these) ---- */
    /* sm: 640px  md: 768px  lg: 1024px  xl: 1280px  2xl: 1536px */

    /* shadcn/ui overrides */
    --background: var(--bg-primary);
    --foreground: var(--text-primary);
    --card: var(--bg-secondary);
    --card-foreground: var(--text-primary);
    --popover: var(--bg-elevated);
    --popover-foreground: var(--text-primary);
    --primary: var(--accent);
    --primary-foreground: #FFFFFF;
    --secondary: var(--bg-tertiary);
    --secondary-foreground: var(--text-primary);
    --muted: var(--bg-tertiary);
    --muted-foreground: var(--text-secondary);
    --accent: var(--bg-hover);
    --accent-foreground: var(--text-primary);
    --destructive: var(--danger);
    --destructive-foreground: #FFFFFF;
    --border: var(--border-default);
    --input: var(--border-default);
    --ring: var(--accent);
    --radius: var(--radius-md);
  }

  * {
    border-color: var(--border-default);
  }

  body {
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* ---- Animations ---- */
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

.animate-fade-in  { animation: fade-in var(--duration-normal) var(--ease-out); }
.animate-slide-up { animation: slide-up var(--duration-slow) var(--ease-out); }
.animate-pulse-dot { animation: pulse-dot 2s infinite; }

/* ---- Scrollbar (thin, dark) ---- */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: var(--radius-full); }
::-webkit-scrollbar-thumb:hover { background: var(--text-tertiary); }

/* ---- Status indicator dot ---- */
.status-dot {
  width: 8px; height: 8px; border-radius: var(--radius-full);
  display: inline-block;
}
.status-dot--online    { background: var(--success); box-shadow: 0 0 6px var(--success); }
.status-dot--offline   { background: var(--text-disabled); }
.status-dot--connected { background: var(--info); box-shadow: 0 0 6px var(--info); }
.status-dot--locked    { background: var(--danger); box-shadow: 0 0 6px var(--danger); }
.status-dot--connecting { background: var(--warning); animation: pulse-dot 1.5s infinite; }

/* ---- Computer grid card ---- */
.computer-card {
  aspect-ratio: 16/9;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: border-color var(--duration-fast) var(--ease-default);
  overflow: hidden;
  cursor: pointer;
}
.computer-card:hover { border-color: var(--border-strong); }
.computer-card--selected { border-color: var(--accent); box-shadow: var(--shadow-glow); }
.computer-card--offline { opacity: 0.5; }

/* ---- Monospace data display ---- */
.mono { font-family: var(--font-mono); font-size: var(--text-sm); }
```

---

## 17. SHARED COMPONENTS BỔ SUNG

Thêm vào `src/components/shared/`:

```
src/components/shared/
├── LoadingSpinner.tsx       # Có trong spec gốc
├── EmptyState.tsx           # Có trong spec gốc
├── ConfirmDialog.tsx        # Có trong spec gốc
├── LanguageSwitcher.tsx     # MỚI — dropdown vi/en/zh
├── ErrorBoundary.tsx        # MỚI — catch React errors
├── Skeleton.tsx             # MỚI — loading placeholder
├── StatusDot.tsx            # MỚI — animated online/offline dot
├── KbdShortcut.tsx          # MỚI — keyboard shortcut indicator
├── DataTable.tsx            # MỚI — reusable table with sort/filter/paginate
├── SearchInput.tsx          # MỚI — debounced search input
└── ToastProvider.tsx        # MỚI — toast notification wrapper
```

### Component specs:

**ErrorBoundary.tsx** — Catch unhandled React errors, show fallback UI thay vì blank screen.

**Skeleton.tsx** — Placeholder loading cho ComputerCard, table rows. Animated shimmer effect.

**StatusDot.tsx** — Colored animated dot cho computer state. Props: `state: ComputerState`.

**KbdShortcut.tsx** — Hiển thị phím tắt: `<KbdShortcut keys={["Ctrl", "A"]} />` → `Ctrl+A`.

**DataTable.tsx** — Reusable cho Admin panel: sortable columns, pagination, search filter. Dùng `@tanstack/react-table`.

**SearchInput.tsx** — Input với debounce 300ms, clear button, search icon.

**ToastProvider.tsx** — Wrapper cho sonner hoặc shadcn toast. Auto-dismiss 5s.

```bash
npm install @tanstack/react-table sonner
```

---

## 18. CẬP NHẬT IMPLEMENTATION ORDER

Thêm vào Section 11 của FE Spec gốc, **chèn sau Step 2, trước Step 3:**

```
Step 2.5: i18n + Utils + Styles (MỚI)
  - npm install i18next react-i18next i18next-browser-languagedetector
  - npm install clsx tailwind-merge @tanstack/react-table sonner
  - Tạo src/i18n/index.ts + 3 locale files (vi, en, zh)
  - Tạo src/lib/cn.ts, formatters.ts, validators.ts, keyboard.ts, clipboard.ts, constants.ts
  - Tạo src/index.css với full design system (Section 16)
  - Tạo shared components: ErrorBoundary, Skeleton, StatusDot, LanguageSwitcher
  - Import i18n trong main.tsx
  - Build verification: npm run dev → no errors, fonts load
```

### CLAUDE.md rule bổ sung:
```markdown
## i18n (BẮT BUỘC)
- MỌI text hiển thị PHẢI qua t() function. KHÔNG hardcode string.
- Import: import { useTranslation } from "react-i18next"
- Key format: dot notation, group theo feature (auth.login, grid.selectAll)
- Khi thêm text mới: thêm vào CẢ 3 file (vi.json, en.json, zh.json)
- Placeholder: {{variable}} syntax
```
