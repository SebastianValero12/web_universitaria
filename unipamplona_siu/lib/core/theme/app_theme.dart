import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.red700,
        primary:   AppColors.red700,
        secondary: AppColors.blue700,
        surface:   AppColors.surfaceCard,
        error:     AppColors.danger,
      ),
      scaffoldBackgroundColor: AppColors.surfacePage,
      textTheme: GoogleFonts.montserratTextTheme().copyWith(
        displayLarge: GoogleFonts.lora(fontWeight: FontWeight.w700, fontStyle: FontStyle.italic),
        displayMedium: GoogleFonts.lora(fontWeight: FontWeight.w700, fontStyle: FontStyle.italic),
        headlineLarge: GoogleFonts.montserrat(fontWeight: FontWeight.w800),
        headlineMedium: GoogleFonts.montserrat(fontWeight: FontWeight.w700),
        titleLarge: GoogleFonts.montserrat(fontWeight: FontWeight.w700),
        titleMedium: GoogleFonts.montserrat(fontWeight: FontWeight.w600),
        bodyMedium: GoogleFonts.montserrat(fontWeight: FontWeight.w400),
        bodySmall: GoogleFonts.montserrat(fontWeight: FontWeight.w400, color: AppColors.gray500),
        labelSmall: GoogleFonts.montserrat(fontWeight: FontWeight.w600, letterSpacing: 0.06),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surfaceCard,
        foregroundColor: AppColors.gray900,
        elevation: 0,
        shadowColor: Colors.black12,
        titleTextStyle: GoogleFonts.montserrat(
          color: AppColors.gray900,
          fontWeight: FontWeight.w700,
          fontSize: 16,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surfaceCard,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.red700,
          foregroundColor: Colors.white,
          textStyle: GoogleFonts.montserrat(fontWeight: FontWeight.w600, fontSize: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          elevation: 0,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceCard,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.gray300, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.gray300, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.blue500, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.danger, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: GoogleFonts.montserrat(color: AppColors.gray500, fontSize: 14),
        labelStyle: GoogleFonts.montserrat(color: AppColors.gray700, fontWeight: FontWeight.w600, fontSize: 13),
      ),
      dividerColor: AppColors.gray200,
    );
  }
}