package com.barofarm.barofarm.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.barofarm.barofarm.Enum.PurchaseDetailStatus;
import com.barofarm.barofarm.entity.PurchaseDetail;
import com.barofarm.barofarm.repository.PurchaseDetailRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderStatusScheduler {

	private final PurchaseDetailRepository purchaseDetailRepository;
	
	@Scheduled(cron = "0 0 2 * * ?")
	public void completeShippedOrders() {
		LocalDateTime threshold = LocalDateTime.now().minusDays(3);
		
		List<PurchaseDetail> targets = 
				purchaseDetailRepository
					.findByStatusAndShippingStartedAtBefore
						(PurchaseDetailStatus.SHIPPING, threshold);
		
		if(targets.isEmpty()) return;
		
		for(PurchaseDetail detail : targets) {
			detail.setStatus(PurchaseDetailStatus.COMPLETE);
			detail.setShippingCompletedAt(LocalDateTime.now());
		}
		
		purchaseDetailRepository.saveAll(targets);
	}
}
