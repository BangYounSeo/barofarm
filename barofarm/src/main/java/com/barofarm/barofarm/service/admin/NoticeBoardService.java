package com.barofarm.barofarm.service.admin;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.barofarm.barofarm.entity.NoticeBoard;
import com.barofarm.barofarm.repository.NoticeBoardRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeBoardService {

    private final NoticeBoardRepository noticeBoardRepository;

    // 전체 목록: 상단 고정(PIN) 먼저, 그 다음 최신순
    public List<NoticeBoard> getAllNotice() {
        return noticeBoardRepository.findAllByOrderByPinDescNumNoticeDesc();
    }

    // 상세보기 + 조회수 증가
    @Transactional
    public NoticeBoard getNotice(Long id) {
        NoticeBoard notice = noticeBoardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        // 조회수 증가
        notice.setViewCount(notice.getViewCount() + 1);

        return notice; // dirty checking 자동 저장
    }

    //조회수 증가 없는 버전 추가
    public NoticeBoard getNoticeWithoutIncrease(Long id) {
        return noticeBoardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
    }

    // 작성
    public NoticeBoard saveNotice(NoticeBoard notice) {
        return noticeBoardRepository.save(notice);
    }

    // 수정
    @Transactional
    public NoticeBoard updateNotice(Long id, NoticeBoard updated) {
        NoticeBoard notice = noticeBoardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        notice.setSubject(updated.getSubject());
        notice.setContent(updated.getContent());
        notice.setUserId(updated.getUserId());
        notice.setPin(updated.isPin());
        notice.setStrong(updated.isStrong());

        return notice; // dirty checking
    }

    // 삭제
    public void deleteNotice(Long id) {
        noticeBoardRepository.deleteById(id);
    }
}

