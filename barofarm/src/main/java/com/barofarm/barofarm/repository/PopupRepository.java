// com.barofarm.barofarm.repository.PopupRepository.java
package com.barofarm.barofarm.repository;

import com.barofarm.barofarm.entity.Popup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PopupRepository extends JpaRepository<Popup, Long> {

    // 현재 노출해야 할 팝업 목록
    List<Popup> findByActiveTrueAndStartAtBeforeAndEndAtAfter(
            LocalDateTime now1,
            LocalDateTime now2
    );
}
