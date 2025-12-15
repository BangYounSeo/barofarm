package com.barofarm.barofarm.dto.member;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.barofarm.barofarm.entity.Settlement;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SettlementDTO {

	private long settlementId;
	
	private int totalAmount;
	private int commissionAmount;
	private int settlementAmount;
	private LocalDateTime completedAt;
	private LocalDateTime scheduleDate;
	
	private String status;
	
	private LocalDate periodStart;
	private LocalDate periodEnd;
	
	public static SettlementDTO from(Settlement entity) {
		return SettlementDTO.builder()
			.settlementId(entity.getSettlementId())
			.totalAmount(entity.getTotalAmount())
			.commissionAmount(entity.getCommissionAmount())
			.settlementAmount(entity.getSettlementAmount())
			.completedAt(entity.getCompletedAt())
			.scheduleDate(entity.getScheduleDate())
			.status(entity.getStatus())
			.periodStart(entity.getPeriodStart())
			.periodEnd(entity.getPeriodEnd())
			.build();
	}
	
}
