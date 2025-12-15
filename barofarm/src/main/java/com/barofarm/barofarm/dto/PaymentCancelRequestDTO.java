package com.barofarm.barofarm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCancelRequestDTO {
    private int numPurD;
    private int quantity;
    private int price;
    private int numOptD;
    private int numPurG;
    private String type;
}

