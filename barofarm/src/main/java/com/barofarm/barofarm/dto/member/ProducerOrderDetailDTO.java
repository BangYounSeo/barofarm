package com.barofarm.barofarm.dto.member;

import java.time.LocalDateTime;

import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.salesBoard.OptionDetailDTO;
import com.barofarm.barofarm.entity.PurchaseDetail;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProducerOrderDetailDTO {

	private int numPurD;
	private int quantity;
	private int unitPrice;
	private int linePrice;
	private String status;
	private String refundReason;
	private LocalDateTime shippingStartedAt;
	private SalesBoardDTO board;
	private OptionDetailDTO option;
	private ProducerOrderDTO orderGroup;
	
	public static ProducerOrderDetailDTO from(PurchaseDetail d) {
        return ProducerOrderDetailDTO.builder()
                .numPurD(d.getNumPurD())
                .quantity(d.getQuantity())
                .unitPrice(d.getFinalPrice())
                .linePrice(d.getFinalPrice())
                .board(SalesBoardDTO.toDTO(d.getSalesBoard()))
                .option(OptionDetailDTO.from(d.getSalesOptionDetail()))
                .orderGroup(ProducerOrderDTO.from(d.getPurchaseGroup()))
                .status(d.getStatus()!=null ? d.getStatus().name() : null)
                .shippingStartedAt(d.getShippingStartedAt()!=null?d.getShippingStartedAt():null)
                .refundReason(d.getRefundReason()!=null?d.getRefundReason():null)
                .build();
    }
}
