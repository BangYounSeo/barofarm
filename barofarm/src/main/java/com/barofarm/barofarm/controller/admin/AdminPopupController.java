// com.barofarm.barofarm.controller.admin.AdminPopupController.java
package com.barofarm.barofarm.controller.admin;

import com.barofarm.barofarm.entity.Popup;
import com.barofarm.barofarm.service.PopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/popups")
public class AdminPopupController {

    private final PopupService popupService;

    @GetMapping
    public Page<Popup> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return popupService.getPopupPage(page, size);
    }

    @PostMapping
    public Popup create(@RequestBody Popup popup) {
        return popupService.create(popup);
    }

    @PutMapping("/{id}")
    public Popup update(@PathVariable Long id, @RequestBody Popup popup) {
        return popupService.update(id, popup);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        popupService.delete(id);
    }
}
