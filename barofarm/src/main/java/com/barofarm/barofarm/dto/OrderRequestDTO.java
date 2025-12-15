package com.barofarm.barofarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Objects;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequestDTO {
    private String type; // "cart" or "direct"
    private String userId;
    private String receiverName;
    private String receiverPhone;
    private String receiverPostalCode;
    private String receiverAddr1;
    private String receiverAddr2;
    private int totalPrice;
    private String merchantUid;
    private List<OrderItemDTO> items; // 항상 items 전체 포함
}
