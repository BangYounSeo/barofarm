package com.barofarm.barofarm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.barofarm.barofarm.entity.NoticeBoard;

public interface NoticeBoardRepository extends JpaRepository<NoticeBoard, Long> {

    // 상단 고정(PIN = true) → 최신순 정렬
    List<NoticeBoard> findAllByOrderByPinDescNumNoticeDesc();
}

