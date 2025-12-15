package com.barofarm.barofarm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.barofarm.barofarm.entity.Review;
import com.barofarm.barofarm.entity.ReviewImage;

public interface ReviewImageRepository extends JpaRepository<ReviewImage, Integer> {
	void deleteByReview(Review review);
	
}