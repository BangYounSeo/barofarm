package com.barofarm.barofarm.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "NOTICE_BOARD")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeBoard {

    // 공지 번호 (PK)
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "NOTICE_BOARD_SEQ_GEN")
    @SequenceGenerator(
            name = "NOTICE_BOARD_SEQ_GEN",
            sequenceName = "NOTICE_BOARD_SEQ",   // 오라클 시퀀스 이름
            allocationSize = 1
    )
    @Column(name = "NUM_NOTICE")
    private Long numNotice;

    // 제목
    @Column(name = "SUBJECT", nullable = false, length = 200)
    private String subject;

    // 내용 (길어질 수 있으니 CLOB)
    @Lob
    @Column(name = "CONTENT", nullable = false)
    private String content;

    // 작성자 ID (MEMBER.USER_ID 와 매칭)
    @Column(name = "USER_ID", nullable = false, length = 50)
    private String userId;

    // 작성일
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정일
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    // 상단 고정 여부 (0/1) → false: 일반, true: 상단 고정
    @Column(name = "PIN", nullable = false)
    private boolean pin;

    // 강조 여부 (0/1) → false: 일반, true: 강조(BOLD, 색상 등)
    @Column(name = "STRONG", nullable = false)
    private boolean strong;

    // 조회수
    @Column(name = "VIEW_COUNT", nullable = false)
    private long viewCount;

    // ====== 자동 세팅 ======
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        // 기본값들 방어코드
        if (!this.pin) {
            this.pin = false;
        }
        if (!this.strong) {
            this.strong = false;
        }
        // null 방지
        if (this.viewCount == 0L) {
            this.viewCount = 0L;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
