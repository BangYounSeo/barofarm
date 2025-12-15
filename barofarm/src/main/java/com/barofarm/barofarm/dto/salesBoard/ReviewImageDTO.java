package com.barofarm.barofarm.dto.salesBoard;

import com.barofarm.barofarm.entity.ReviewImage;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewImageDTO {
	
	private final int numRevImg;
    private final String originalFileName;
    private final String saveFileName;
    private final String path;
    private final String isThumbnail;
    private final int sortOrder;
    private final String url; // ⭐ 추가!
    
    public static ReviewImageDTO from(ReviewImage entity) {
        return ReviewImageDTO.builder()
                .numRevImg(entity.getNumRevImg())
                .originalFileName(entity.getOriginalFileName())
                .saveFileName(entity.getSaveFileName())
                .path(entity.getPath())
                .isThumbnail(entity.getIsThumbnail())
                .url(entity.getUrl()) // ⭐ 필수: S3 URL 주입!
                .sortOrder(entity.getSortOrder())
                .build();
    }

}
