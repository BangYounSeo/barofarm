package com.barofarm.barofarm.scheduler;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.barofarm.barofarm.Enum.PurchaseDetailStatus;
import com.barofarm.barofarm.Enum.TransactionType;
import com.barofarm.barofarm.entity.PlatformAmountTransaction;
import com.barofarm.barofarm.entity.Producer;
import com.barofarm.barofarm.entity.PurchaseDetail;
import com.barofarm.barofarm.entity.Settlement;
import com.barofarm.barofarm.entity.SettlementDetail;
import com.barofarm.barofarm.repository.PlatformAmountTransactionRepository;
import com.barofarm.barofarm.repository.PurchaseDetailRepository;
import com.barofarm.barofarm.repository.SettlementDetailRepository;
import com.barofarm.barofarm.repository.SettlementRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WeeklySettlementScheduler {

	private final PurchaseDetailRepository purchaseDetailRepository;
	private final PlatformAmountTransactionRepository platformAmountTransactionRepository;
	private final SettlementRepository settlementRepository;
	private final SettlementDetailRepository settlementDetailRepository;
	
	@Scheduled(cron = "0 0 3 * * MON")
	@Transactional
	public void settleLastWeek() {
		
		LocalDate today = LocalDate.now();
		LocalDate lastMonday = today.minusWeeks(2).with(DayOfWeek.MONDAY);
		LocalDate lastSunday = lastMonday.plusDays(6);
		
		LocalDateTime from = lastMonday.atStartOfDay();
		LocalDateTime to = lastSunday.plusDays(1).atStartOfDay().minusNanos(1);
		
		List<PurchaseDetail> targets = purchaseDetailRepository
				.findSettlementTargets(PurchaseDetailStatus.COMPLETE, from, to);
		
		if(targets.isEmpty()) {
			System.out.println("정산 대상 없음");
			return;
		}
		
		Map<Producer, List<PurchaseDetail>> byProducer = targets.stream().
				collect(Collectors.groupingBy(pd -> pd.getSalesBoard().getProducer()));
		
		for(Map.Entry<Producer, List<PurchaseDetail>> entry : byProducer.entrySet()) {
			Producer producer = entry.getKey();
			
			List<PurchaseDetail> producerDetails = entry.getValue();

            int totalAmount = producerDetails.stream()
                    .mapToInt(PurchaseDetail::getFinalPrice)
                    .sum();

            int commissionAmount = calcCommission(totalAmount); // 수수료 계산
            int settlementAmount = totalAmount - commissionAmount;

            // 4) Settlement 엔티티 생성
            Settlement settlement = new Settlement();
            settlement.setProducer(producer);
            settlement.setTotalAmount(totalAmount);
            settlement.setCommissionAmount(commissionAmount);
            settlement.setSettlementAmount(settlementAmount);
            settlement.setScheduleDate(LocalDateTime.now()); // 지금이 정산일
            settlement.setCompletedAt(LocalDateTime.now());  // 바로 지급했다고 가정
            settlement.setPeriodStart(lastMonday);
            settlement.setPeriodEnd(lastSunday);
            settlement.setStatus("DONE");

            settlementRepository.save(settlement);

            // 5) 각 PurchaseDetail별 SettlementDetail 생성
            for (PurchaseDetail pd : producerDetails) {
                SettlementDetail detail = new SettlementDetail();
                detail.setSettlement(settlement);
                detail.setPurchaseDetail(pd);
                detail.setOrderAmount(pd.getFinalPrice());

                int fee = calcCommission(pd.getFinalPrice());
                detail.setPlatformFee(fee);
                detail.setAmountForProducer(pd.getFinalPrice() - fee);

                settlement.getDetails().add(detail);
                pd.setSettlementDetail(detail); // 양방향 관계 세팅(있다면)
                
                settlementDetailRepository.save(detail);
            }

            // 6) 플랫폼 거래 로그 생성 (WITHDRAW)
            PlatformAmountTransaction tx = new PlatformAmountTransaction();
            tx.setType(TransactionType.WITHDRAW);
            tx.setAmount(settlementAmount);
            tx.setSettlement(settlement);
            tx.setMemo("주간 정산 (" + lastMonday + " ~ " + lastSunday + ") - 판매자:" + producer.getFarmName());

            platformAmountTransactionRepository.save(tx);
		}
	}
	
	private int calcCommission(int totalAmount) {
	    double rate = 0.02;
	    return (int) Math.round(totalAmount * rate);
	}
}
