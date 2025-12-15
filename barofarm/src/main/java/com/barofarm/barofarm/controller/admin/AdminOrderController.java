// com.barofarm.barofarm.controller.admin.AdminOrderController

package com.barofarm.barofarm.controller.admin;

import com.barofarm.barofarm.Enum.PurchaseDetailStatus;
import com.barofarm.barofarm.dto.admin.AdminPurchaseGroupDTO;
import com.barofarm.barofarm.dto.admin.AdminPurchaseSummaryDTO;
import com.barofarm.barofarm.service.admin.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")   // 🔹 여기까지만 공통 prefix
public class AdminOrderController {

    private final AdminOrderService orderService;

    /** ① 주문 목록 + 검색 */
    @GetMapping("/orders")
    public Page<AdminPurchaseSummaryDTO> getOrders(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String searchType
    ) {
        return orderService.getOrders(page, size, keyword, searchType);
    }

    /** ② 주문 상세 보기 */
    @GetMapping("/orders/{numPurG}")
    public AdminPurchaseGroupDTO getOrder(@PathVariable Long numPurG) {
        return orderService.getOrder(numPurG);
    }

    /** ③ 주문 상태 변경 (그룹 상태) */
    @PatchMapping("/orders/{numPurG}/status")
    public void changeStatus(
            @PathVariable int numPurG,
            @RequestParam String status
    ) {
        orderService.changeStatus(numPurG, status);
    }

    /** ④ 디테일 상태 변경 */
    @PatchMapping("/orders/details/{numPurD}/status")
    public void changeDetailStatus(
            @PathVariable Long numPurD,
            @RequestParam String status
    ) {
        PurchaseDetailStatus newStatus = PurchaseDetailStatus.valueOf(status);
        orderService.changeDetailStatus(numPurD, newStatus);
    }
}
