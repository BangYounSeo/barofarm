// com.barofarm.barofarm.controller.admin.AdminPaymentController
package com.barofarm.barofarm.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import com.barofarm.barofarm.entity.Payment;
import com.barofarm.barofarm.repository.PaymentRepository;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {

    private final PaymentRepository paymentRepository;

    @GetMapping
    public Page<Payment> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status   // DONE / CANCELED ...
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "created"));

        if (status == null || status.isEmpty()) {
            return paymentRepository.findAll(pageable);
        }
        return paymentRepository.findByStatus(status, pageable);
    }
}
