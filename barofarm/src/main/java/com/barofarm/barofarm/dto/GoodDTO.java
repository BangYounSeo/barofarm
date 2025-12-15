package com.barofarm.barofarm.dto;

import com.barofarm.barofarm.entity.Good;
import com.barofarm.barofarm.entity.SalesBoard;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Getter
@Builder
public class GoodDTO {
	
	private final int goodId;
	private final String targetId;
	private final SalesBoardDTO board;
	
	public static GoodDTO from(Good entity,SalesBoard boardData) {
		return GoodDTO.builder()
				.goodId(entity.getGoodId())
				.targetId(entity.getTargetId())
				.board(SalesBoardDTO.toDTO(boardData))
				.build();
	}
}
