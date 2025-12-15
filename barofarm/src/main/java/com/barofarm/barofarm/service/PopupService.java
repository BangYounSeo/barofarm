// com.barofarm.barofarm.service.PopupService.java
package com.barofarm.barofarm.service;

import com.barofarm.barofarm.entity.Popup;
import com.barofarm.barofarm.repository.PopupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PopupService {

    private final PopupRepository popupRepository;

    // 프론트에서 쓸: 현재 노출해야 하는 팝업 목록
    @Transactional(readOnly = true)
    public List<Popup> getActivePopups() {
        LocalDateTime now = LocalDateTime.now();
        return popupRepository.findByActiveTrueAndStartAtBeforeAndEndAtAfter(now, now);
    }

    // 관리자용 목록
    @Transactional(readOnly = true)
    public Page<Popup> getPopupPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return popupRepository.findAll(pageable);
    }

    // 관리자용 생성/수정/삭제 (간단 버전)
    public Popup create(Popup popup) {
        return popupRepository.save(popup);
    }

    public Popup update(Long id, Popup dto) {
        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("popup not found"));
        popup.setTitle(dto.getTitle());
        popup.setContent(dto.getContent());
        popup.setImageUrl(dto.getImageUrl());
        popup.setLinkUrl(dto.getLinkUrl());
        popup.setStartAt(dto.getStartAt());
        popup.setEndAt(dto.getEndAt());
        popup.setActive(dto.isActive());
        popup.setWidth(dto.getWidth());
        popup.setHeight(dto.getHeight());
        return popup;
    }

    public void delete(Long id) {
        popupRepository.deleteById(id);
    }
}
