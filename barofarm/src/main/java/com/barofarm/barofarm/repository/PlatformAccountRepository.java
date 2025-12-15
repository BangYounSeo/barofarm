package com.barofarm.barofarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.barofarm.barofarm.entity.PlatformAccount;

@Repository
public interface PlatformAccountRepository extends JpaRepository<PlatformAccount, Long> {

    @Query(
        value = "SELECT NVL(SUM(BALANCE), 0) FROM PLATFORM_ACCOUNT",
        nativeQuery = true
    )
    Long findTotalBalance();
    
}
