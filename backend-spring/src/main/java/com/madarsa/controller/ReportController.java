package com.madarsa.controller;

import com.madarsa.model.*;
import com.madarsa.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final FinanceRepository financeRepository;
    private final AdmissionRepository admissionRepository;
    private final DonationRepository donationRepository;

    // Student Report - Excel
    @GetMapping("/students")
    public ResponseEntity<byte[]> generateStudentReport() {
        try {
            List<User> students = userRepository.findByUserType("STUDENT");
            
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Students");
            
            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Name", "Email", "Mobile", "Status", "Registration Date"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Data rows
            int rowNum = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
            for (User student : students) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(student.getId());
                row.createCell(1).setCellValue(student.getName());
                row.createCell(2).setCellValue(student.getEmail());
                row.createCell(3).setCellValue(student.getMobile());
                row.createCell(4).setCellValue(student.getApprovalStatus() != null ? student.getApprovalStatus() : "PENDING");
                row.createCell(5).setCellValue(student.getCreatedAt() != null ? student.getCreatedAt().format(formatter) : "");
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            workbook.close();
            
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            responseHeaders.setContentDisposition(ContentDisposition.attachment()
                .filename("student_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx")
                .build());
            
            return new ResponseEntity<>(out.toByteArray(), responseHeaders, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error generating student report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Teacher Report - Excel
    @GetMapping("/teachers")
    public ResponseEntity<byte[]> generateTeacherReport() {
        try {
            List<Teacher> teachers = teacherRepository.findAll();
            
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Teachers");
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Name", "Subject", "Classes", "Contact", "Status"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (Teacher teacher : teachers) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(teacher.getId());
                row.createCell(1).setCellValue(teacher.getName());
                row.createCell(2).setCellValue(teacher.getSubject());
                row.createCell(3).setCellValue(teacher.getClasses());
                row.createCell(4).setCellValue(teacher.getContact());
                row.createCell(5).setCellValue(teacher.getStatus());
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            workbook.close();
            
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            responseHeaders.setContentDisposition(ContentDisposition.attachment()
                .filename("teacher_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx")
                .build());
            
            return new ResponseEntity<>(out.toByteArray(), responseHeaders, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error generating teacher report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Finance Report - Excel
    @GetMapping("/finance")
    public ResponseEntity<byte[]> generateFinanceReport() {
        try {
            List<Finance> transactions = financeRepository.findAll();

            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Finance");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GOLD.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Type", "Category", "Amount", "Description", "Payment Method", "Date"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            double totalIncome = 0, totalExpense = 0;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

            for (Finance finance : transactions) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(finance.getId());
                row.createCell(1).setCellValue(finance.getType() != null ? finance.getType() : "");
                row.createCell(2).setCellValue(finance.getCategory());
                row.createCell(3).setCellValue(finance.getAmount() != null ? finance.getAmount() : 0);
                row.createCell(4).setCellValue(finance.getDescription());
                row.createCell(5).setCellValue("");
                row.createCell(6).setCellValue(finance.getDate() != null ? finance.getDate().format(formatter) : "");

                if ("INCOME".equalsIgnoreCase(finance.getType())) {
                    totalIncome += finance.getAmount() != null ? finance.getAmount() : 0;
                } else {
                    totalExpense += finance.getAmount() != null ? finance.getAmount() : 0;
                }
            }

            // Summary rows
            rowNum++;
            Row incomeRow = sheet.createRow(rowNum++);
            incomeRow.createCell(2).setCellValue("Total Income:");
            incomeRow.createCell(3).setCellValue(totalIncome);

            Row expenseRow = sheet.createRow(rowNum++);
            expenseRow.createCell(2).setCellValue("Total Expense:");
            expenseRow.createCell(3).setCellValue(totalExpense);

            Row balanceRow = sheet.createRow(rowNum);
            balanceRow.createCell(2).setCellValue("Balance:");
            balanceRow.createCell(3).setCellValue(totalIncome - totalExpense);

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            workbook.close();

            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            responseHeaders.setContentDisposition(ContentDisposition.attachment()
                .filename("finance_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx")
                .build());

            return new ResponseEntity<>(out.toByteArray(), responseHeaders, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error generating finance report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Admission Report
    @GetMapping("/admissions")
    public ResponseEntity<byte[]> generateAdmissionReport() {
        try {
            List<Admission> admissions = admissionRepository.findAll();

            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Admissions");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"Admission No", "Student Name", "Father Name", "Class", "Phone", "Status", "Date"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
            for (Admission admission : admissions) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(admission.getAdmissionNo() != null ? admission.getAdmissionNo() : "");
                row.createCell(1).setCellValue(admission.getFullName());
                row.createCell(2).setCellValue(admission.getFatherName());
                row.createCell(3).setCellValue(admission.getClassName());
                row.createCell(4).setCellValue(admission.getParentPhone());
                row.createCell(5).setCellValue(admission.getStatus() != null ? admission.getStatus() : "pending");
                row.createCell(6).setCellValue(admission.getCreatedAt() != null ? admission.getCreatedAt().format(formatter) : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            workbook.close();

            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            responseHeaders.setContentDisposition(ContentDisposition.attachment()
                .filename("admission_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx")
                .build());

            return new ResponseEntity<>(out.toByteArray(), responseHeaders, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error generating admission report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Donation Report
    @GetMapping("/donations")
    public ResponseEntity<byte[]> generateDonationReport() {
        try {
            List<Donation> donations = donationRepository.findAll();

            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Donations");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Donor Name", "Email", "Phone", "Amount", "Type", "Status", "Date"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            double totalAmount = 0;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

            for (Donation donation : donations) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(donation.getId());
                row.createCell(1).setCellValue(donation.getDonorName() != null ? donation.getDonorName() : "");
                row.createCell(2).setCellValue(donation.getDonorEmail() != null ? donation.getDonorEmail() : "");
                row.createCell(3).setCellValue(donation.getDonorPhone() != null ? donation.getDonorPhone() : "");
                row.createCell(4).setCellValue(donation.getAmount() != null ? donation.getAmount() : 0);
                row.createCell(5).setCellValue(donation.getDonationType() != null ? donation.getDonationType() : "");
                row.createCell(6).setCellValue(donation.getStatus() != null ? donation.getStatus() : "PENDING");
                row.createCell(7).setCellValue(donation.getCreatedAt() != null ? donation.getCreatedAt().format(formatter) : "");

                if ("COMPLETED".equalsIgnoreCase(donation.getStatus())) {
                    totalAmount += donation.getAmount() != null ? donation.getAmount() : 0;
                }
            }

            rowNum++;
            Row totalRow = sheet.createRow(rowNum);
            totalRow.createCell(3).setCellValue("Total Completed:");
            totalRow.createCell(4).setCellValue(totalAmount);

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            workbook.close();

            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            responseHeaders.setContentDisposition(ContentDisposition.attachment()
                .filename("donation_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx")
                .build());

            return new ResponseEntity<>(out.toByteArray(), responseHeaders, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error generating donation report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

