package com.barofarm.barofarm.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import lombok.*;

@Entity
@Table(name = "BANNER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {

    @Id
    @GeneratedValue
    (strategy = GenerationType.SEQUENCE, generator = "banner_seq")
    @SequenceGenerator(
            name = "banner_seq",
            sequenceName = "BANNER_SEQ",
            allocationSize = 1
    )
    @Column(name = "banner_id")
    private Long bannerId;

    @Column(name = "image_url", nullable = false) //S3 URL 저장
    private String imageUrl;

    @Column(name = "link_url") //배너 클릭 시 이동할 주소 (옵션)
    private String linkUrl;

    @Column(name = "sort_order") //배너 순서
    private Integer sortOrder;

    @Column(name = "use_yn") //출력 여부
    private String useYn;

    //메인배너 / 중간배너 구분
    @Column(name = "position")
    private String position;  // MAIN / MID
    
    @Column(name = "title") //출력 여부
    private String title;
    
    //큰 문구
    @Column(name = "main_text")
    private String mainText;

    //작은 문구
    @Column(name = "sub_text")
    private String subText;
}
