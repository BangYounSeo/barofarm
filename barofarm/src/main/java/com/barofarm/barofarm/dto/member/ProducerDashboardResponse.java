package com.barofarm.barofarm.dto.member;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProducerDashboardResponse {

	private int todayOrder;
	private int yesterdayOrder;
	private int todaySales;
	private int yesterdaySales;
	private int readyShipCount;
	private int settlementAmount;
	
	private List<ProducerMainResponse> recentOrders;
	
}
