package com.barofarm.barofarm.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort; 

import com.barofarm.barofarm.dto.member.ProducerDTO;
import com.barofarm.barofarm.entity.Producer;
import com.barofarm.barofarm.repository.ProducerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminProducerService {
    
    private final ProducerRepository producerRepository;

    public Page<ProducerDTO> getProducers(int page, int size, String status, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "proId"));

        Page<Producer> result;

        if (status != null && !status.isEmpty()) {
            // 상태 + 키워드 검색
            if (keyword != null && !keyword.isEmpty()) {
                result = producerRepository
                        .findByStatusAndFarmNameContainingIgnoreCaseOrMember_UserIdContainingIgnoreCase(
                                status, keyword, keyword, pageable);
            } else {
                result = producerRepository.findByStatus(status, pageable);
            }
        } else {
            // 상태 전체, 키워드만
            if (keyword != null && !keyword.isEmpty()) {
                result = producerRepository
                        .findByFarmNameContainingIgnoreCaseOrMember_UserIdContainingIgnoreCase(
                                keyword, keyword, pageable);
            } else {
                result = producerRepository.findAll(pageable);
            }
        }

        return result.map(ProducerDTO::from);
    }

    public void updateStatus(Long proId, String newStatus, String reason) {
        Producer producer = producerRepository.findById(proId)
                .orElseThrow(() -> new IllegalArgumentException("해당 셀러가 존재하지 않습니다. proId=" + proId));

        producer.setStatus(newStatus);
        producer.setReason(reason);
        producerRepository.save(producer);
    }

}
