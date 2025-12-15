package com.barofarm.barofarm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AddressOnly {
    private Long addressId;
    private String alias;
    private String receiver;
    private String phone;
    private String postalCode;
    private String addr1;
    private String addr2;
    private int deleted;
    private int isDefault;
}
