package com.barofarm.barofarm.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.barofarm.barofarm.entity.NoticeBoard;
import com.barofarm.barofarm.service.admin.NoticeBoardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notice")
public class NoticeBoardController {

    private final NoticeBoardService noticeBoardService;

    // 목록 불러오기 (상단고정 순 + 최신순)
    @GetMapping
    public List<NoticeBoard> getList() {
        return noticeBoardService.getAllNotice();
    }

    // 상세보기 (조회수 증가 포함)
    @GetMapping("/{id}")
    public NoticeBoard getDetail(@PathVariable Long id) {
        return noticeBoardService.getNotice(id);
    }

    // 조회수 증가없는 버전
    @GetMapping("/admin/{id}")
    public NoticeBoard getDetailAdmin(@PathVariable Long id) {
        return noticeBoardService.getNoticeWithoutIncrease(id);
    }

    // 등록
    @PostMapping
    public NoticeBoard create(@RequestBody NoticeBoard notice) {
        return noticeBoardService.saveNotice(notice);
    }

    // 수정
    @PutMapping("/{id}")
    public NoticeBoard update(@PathVariable Long id, @RequestBody NoticeBoard notice) {
        return noticeBoardService.updateNotice(id, notice);
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        noticeBoardService.deleteNotice(id);
        return ResponseEntity.ok().build();
    }
}
