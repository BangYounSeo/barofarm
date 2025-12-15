package com.barofarm.barofarm.dto.admin;

import com.barofarm.barofarm.entity.NoticeBoard;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeBoardDTO {

    private Long numNotice;
    private String subject;
    private String content;
    private String userId;
    private String createdAt;
    private String updatedAt;
    private boolean pin;
    private boolean strong;
    private long viewCount;

    public static NoticeBoardDTO fromEntity(NoticeBoard n) {
        return NoticeBoardDTO.builder()
                .numNotice(n.getNumNotice())
                .subject(n.getSubject())
                .content(n.getContent())
                .userId(n.getUserId())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null)
                .updatedAt(n.getUpdatedAt() != null ? n.getUpdatedAt().toString() : null)
                .pin(n.isPin())
                .strong(n.isStrong())
                .viewCount(n.getViewCount())
                .build();
    }
}

