package com.barofarm.barofarm.dto.member;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class SettlementChart {

	private String label;
	private int amount;
	private LocalDate periodStart;
	private LocalDate periodEnd;
}
