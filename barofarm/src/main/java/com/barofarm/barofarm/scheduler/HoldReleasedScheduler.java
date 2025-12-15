package com.barofarm.barofarm.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.barofarm.barofarm.Enum.PurchaseDetailStatus;
import com.barofarm.barofarm.Enum.TransactionType;
import com.barofarm.barofarm.entity.PlatformAmountTransaction;
import com.barofarm.barofarm.entity.PurchaseDetail;
import com.barofarm.barofarm.repository.PlatformAmountTransactionRepository;
import com.barofarm.barofarm.repository.PurchaseDetailRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class HoldReleasedScheduler {

	private final PurchaseDetailRepository purchaseDetailRepository;
	private final PlatformAmountTransactionRepository platformAmountTransactionRepository;
	
	@Scheduled(cron = "0 0 2 * * ?")
	@Transactional
	public void releaseHoldAfterRefundPeriod() {
	LocalDateTime threshold = LocalDateTime.now().minusDays(3);
	
	List<PurchaseDetail> targets =
            purchaseDetailRepository
            	.findByStatusAndShippingCompletedAtBeforeAndHoldReleasedFalse(
                	PurchaseDetailStatus.COMPLETE,
                	threshold
                );
		if(targets.isEmpty()) return;
		
		for(PurchaseDetail detail : targets) {
			int amount = detail.getFinalPrice();
			
			PlatformAmountTransaction tx = new PlatformAmountTransaction();
			
			tx.setType(TransactionType.SETTLE);
			tx.setAmount(amount);
			tx.setPurchaseDetail(detail);
			tx.setMemo("환불 가능 기간 종료로 홀드 해제");
			platformAmountTransactionRepository.save(tx);
			
			detail.setHoldReleased(true);
			
		}
	}
}
