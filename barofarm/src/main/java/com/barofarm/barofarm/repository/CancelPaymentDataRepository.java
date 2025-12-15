package com.barofarm.barofarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.barofarm.barofarm.entity.CancelPaymentData;

public interface CancelPaymentDataRepository extends JpaRepository<CancelPaymentData, Long> {
}