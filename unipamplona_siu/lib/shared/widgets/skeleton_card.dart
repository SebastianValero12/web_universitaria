import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme/app_colors.dart';

class SkeletonCard extends StatelessWidget {
  final double height;
  final double? width;
  final double radius;

  const SkeletonCard({
    super.key,
    this.height = 100,
    this.width,
    this.radius = 14,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor:      AppColors.gray100,
      highlightColor: AppColors.gray200,
      child: Container(
        width:  width ?? double.infinity,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.gray100,
          borderRadius: BorderRadius.circular(radius),
        ),
      ),
    );
  }
}

class SkeletonText extends StatelessWidget {
  final double width;
  final double height;

  const SkeletonText({super.key, this.width = double.infinity, this.height = 14});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor:      AppColors.gray100,
      highlightColor: AppColors.gray200,
      child: Container(
        width:  width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.gray100,
          borderRadius: BorderRadius.circular(6),
        ),
      ),
    );
  }
}