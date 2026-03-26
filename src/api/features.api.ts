import client from "./client";
import type {
    BatchFeatureRequest,
    BatchFeatureResponse,
    FeatureControlRequest,
    FeatureDto,
    FeatureListDto,
} from "./types";

export const featuresApi = {
    getAll: (computerId: string) =>
        client
            .get<FeatureListDto>(
                `/api/v1/computers/${computerId}/features`,
            )
            .then((r) => r.data),

    getById: (computerId: string, featureId: string) =>
        client
            .get<FeatureDto>(
                `/api/v1/computers/${computerId}/features/${featureId}`,
            )
            .then((r) => r.data),

    control: (
        computerId: string,
        featureId: string,
        data: FeatureControlRequest,
    ) =>
        client
            .put(
                `/api/v1/computers/${computerId}/features/${featureId}`,
                data,
            )
            .then((r) => r.data),

    /** v2: batch feature control across multiple computers */
    batch: (data: BatchFeatureRequest) =>
        client
            .post<BatchFeatureResponse>("/api/v2/batch/features", data)
            .then((r) => r.data),
};
