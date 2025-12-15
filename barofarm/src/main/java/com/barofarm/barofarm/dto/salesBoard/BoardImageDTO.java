package com.barofarm.barofarm.dto.salesBoard;

import com.barofarm.barofarm.entity.BoardImage;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BoardImageDTO {
	

    private final int numBrdImg;        // 이미지 ID
    private final String originalFileName;
    private final String saveFileName;
    private final String path;
    private final String isThumbnail;   // 썸네일 여부
    private final int sortOrder;        // 이미지 정렬 순서
    
    /**
     * Entity → DTO 변환
     */
    public static BoardImageDTO from(BoardImage entity) {
        return BoardImageDTO.builder()
                .numBrdImg(entity.getNumBrdImg())
                .originalFileName(entity.getOriginalFileName())
                .saveFileName(entity.getSaveFileName())
                // ⭐⭐ 여기만 수정하면 끝 ⭐⭐
                .path(entity.getPath()) // ⭐ 기존 값 그대로 사용! (S3 URL)
                .isThumbnail(entity.getIsThumbnail())
                .sortOrder(entity.getSortOrder())
                .build();
    }

}
