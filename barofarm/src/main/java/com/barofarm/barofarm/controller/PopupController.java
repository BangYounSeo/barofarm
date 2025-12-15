// com.barofarm.barofarm.controller.PopupController.java
package com.barofarm.barofarm.controller;

import com.barofarm.barofarm.entity.Popup;
import com.barofarm.barofarm.service.PopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/popups")
public class PopupController {

    private final PopupService popupService;

    // 메인화면에서 호출: 현재 노출할 팝업 리스트
    @GetMapping("/active")
    public List<Popup> getActivePopups() {
        return popupService.getActivePopups();
    }
}
