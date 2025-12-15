// com.barofarm.barofarm.entity.Popup.java
package com.barofarm.barofarm.entity;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "POPUP")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Popup {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "POPUP_SEQ_GEN")
    @SequenceGenerator(
            name = "POPUP_SEQ_GEN",
            sequenceName = "POPUP_SEQ",
            allocationSize = 1
    )
    private Long id;

    // 팝업 제목
    @Column(nullable = false)
    private String title;

    // 팝업 내용 (HTML 또는 텍스트)
    @Lob
    @Column(nullable = false)
    private String content;

    // 배너 이미지가 필요하면
    private String imageUrl;

    // 클릭 시 이동할 링크 (선택)
    private String linkUrl;

    // 노출 시작/종료 시각
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    // 관리자가 직접 on/off
    private boolean active;

    //맘대로 크기조절하기
    private Integer width;   // px 단위 (nullable)
    private Integer height;
}
