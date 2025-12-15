package com.barofarm.barofarm.dto.member;

import java.time.LocalDateTime;
import java.util.List;

import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.salesBoard.OptionDetailDTO;
import com.barofarm.barofarm.entity.PurchaseDetail;
import com.barofarm.barofarm.entity.PurchaseGroup;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProducerOrderDTO {

	private LocalDateTime orderDate;
	private String status;
	private String receiverName;
	private String receiverPhone;
	private String receiverPostalCode;
	private String receiverAddr1;
	private String receiverAddr2;
	private String buyer;
	
	public static ProducerOrderDTO from(PurchaseGroup entity) {
		
		return ProducerOrderDTO.builder()
				.orderDate(entity.getOrderDate())
				.status(entity.getStatus())
				.receiverName(entity.getReceiverName())
				.receiverPhone(entity.getReceiverPhone())
				.receiverPostalCode(entity.getReceiverPostalCode())
				.receiverAddr1(entity.getReceiverAddr1())
				.receiverAddr2(entity.getReceiverAddr2())
				.buyer(entity.getMember().getName())
				.build();
	}
	
	public static ProducerOrderDTO from(PurchaseGroup group, String status) {

        return ProducerOrderDTO.builder()
                .orderDate(group.getOrderDate())
                .status(status)
                .receiverName(group.getReceiverName())
                .receiverPhone(group.getReceiverPhone())
                .receiverPostalCode(group.getReceiverPostalCode())
                .receiverAddr1(group.getReceiverAddr1())
                .receiverAddr2(group.getReceiverAddr2())
                .buyer(group.getMember().getName())
                .build();
    }
}
