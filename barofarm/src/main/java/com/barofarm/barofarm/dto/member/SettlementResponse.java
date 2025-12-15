package com.barofarm.barofarm.dto.member;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SettlementResponse {

	private int monthSales;
	private int weeklySettlement;
	private int totalSettlement;
	private List<SettlementDTO> settlement;
	
	private String chartMode;
	private List<SettlementChart> chart;
}
