package com.barofarm.barofarm.dto.member;

import com.barofarm.barofarm.entity.MemberAddress;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberAddressDTO {

	private Long addressId;
	private String alias;
	private String receiver;
	private String phone;
	private String postalCode;
	private String addr1;
	private String addr2;
	private int isDefault;
	private String lastUsedAt;
	private int usedCount;
	
	public static MemberAddressDTO from(MemberAddress entity) {
		return MemberAddressDTO.builder()
				.addressId(entity.getAddressId())
				.alias(entity.getAlias())
				.receiver(entity.getReceiver())
				.phone(entity.getPhone())
				.postalCode(entity.getPostalCode())
				.addr1(entity.getAddr1())
				.addr2(entity.getAddr2())
				.isDefault(entity.getIsDefault())
				.lastUsedAt(entity.getLastUsedAt() != null?
						entity.getLastUsedAt().toString() : null)
				.usedCount(entity.getUsedCount())
				.build();
	}
}
