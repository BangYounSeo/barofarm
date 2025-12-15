package com.barofarm.barofarm.dto.member;

import com.barofarm.barofarm.entity.Member;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WriterDetail {
	
	public String userId;
	public String name;
	
	  /**
     * Entity → DTO 변환 메서드
     */
    public static WriterDetail from(Member entity) {
        return WriterDetail.builder()
                .userId(entity.getUserId())
                .name(entity.getName())
                .build();
    }

}
