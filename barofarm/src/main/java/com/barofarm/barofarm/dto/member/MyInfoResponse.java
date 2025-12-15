package com.barofarm.barofarm.dto.member;

import java.util.List;

import com.barofarm.barofarm.dto.GoodDTO;
import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.salesBoard.QnaDTO;
import com.barofarm.barofarm.dto.salesBoard.ReviewDTO;

import lombok.Data;

@Data
public class MyInfoResponse {
	
	private int qna;
	private int review;
	private MyInfoDTO user;
	private int purchase;
	private int good;

}
