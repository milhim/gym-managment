const ExcelJS = require('exceljs');

class ExportController {
    constructor(getMembers, getStatistics) {
        this.getMembers = getMembers;
        this.getStatistics = getStatistics;
    }

    async exportMembers(req, res) {
        try {
            // Get all members without pagination
            const result = await this.getMembers.execute({}, 1, 1000);
            const members = result.members;

            // Get statistics
            const stats = await this.getStatistics.execute();

            // Create workbook
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Gym Management System';
            workbook.created = new Date();

            // Create members sheet
            const membersSheet = workbook.addWorksheet('الأعضاء');

            // Set RTL for Arabic
            membersSheet.views = [{ rightToLeft: true }];

            // Define columns
            membersSheet.columns = [
                { header: 'الاسم', key: 'name', width: 20 },
                { header: 'رقم الهاتف', key: 'phoneNumber', width: 15 },
                { header: 'تاريخ الانضمام', key: 'joinDate', width: 15 },
                { header: 'رسوم العضوية', key: 'totalMembership', width: 15 },
                { header: 'المبلغ المدفوع', key: 'paidAmount', width: 15 },
                { header: 'المبلغ المتبقي', key: 'remainingAmount', width: 15 },
                { header: 'نسبة الدفع', key: 'paymentPercentage', width: 15 },
                { header: 'حالة الدفع', key: 'paymentStatus', width: 15 },
                { header: 'آخر دفعة', key: 'lastPaymentDate', width: 15 }
            ];

            // Style header row
            const headerRow = membersSheet.getRow(1);
            headerRow.font = { bold: true, size: 12 };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

            // Add member data
            members.forEach(member => {
                const row = membersSheet.addRow({
                    name: member.name,
                    phoneNumber: member.phoneNumber,
                    joinDate: new Date(member.joinDate).toLocaleDateString('ar-SA'),
                    totalMembership: member.totalMembership,
                    paidAmount: member.paidAmount,
                    remainingAmount: member.remainingAmount,
                    paymentPercentage: `${member.paymentPercentage.toFixed(1)}%`,
                    paymentStatus: this.getPaymentStatusInArabic(member.membershipStatus),
                    lastPaymentDate: member.lastPaymentDate
                        ? new Date(member.lastPaymentDate).toLocaleDateString('ar-SA')
                        : '-'
                });

                // Color code based on payment status
                if (member.membershipStatus === 'paid') {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF90EE90' }
                    };
                } else if (member.membershipStatus === 'unpaid') {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFA07A' }
                    };
                } else if (member.membershipStatus === 'partial') {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFF99' }
                    };
                }
            });

            // Add borders to all cells
            membersSheet.eachRow((row, rowNumber) => {
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Create statistics sheet
            const statsSheet = workbook.addWorksheet('الإحصائيات');
            statsSheet.views = [{ rightToLeft: true }];

            // Add statistics data
            const statsData = [
                ['البيان', 'القيمة'],
                ['إجمالي الأعضاء', stats.totalMembers],
                ['الأعضاء المكتملو الدفع', stats.paidMembers],
                ['الأعضاء الجزئيو الدفع', stats.partiallyPaidMembers],
                ['الأعضاء غير المدفوعين', stats.unpaidMembers],
                ['إجمالي الإيرادات', `${stats.totalRevenue.toLocaleString()} ل.س`],
                ['الإيرادات المتوقعة', `${stats.expectedRevenue.toLocaleString()} ل.س`],
                ['المبلغ المتبقي', `${stats.remainingAmount.toLocaleString()} ل.س`]
            ];

            statsData.forEach((row, index) => {
                const excelRow = statsSheet.addRow(row);
                if (index === 0) {
                    excelRow.font = { bold: true, size: 12 };
                    excelRow.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF4472C4' }
                    };
                    excelRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                }
                excelRow.alignment = { horizontal: 'center', vertical: 'middle' };
            });

            // Style statistics sheet
            statsSheet.columns = [
                { header: 'البيان', key: 'label', width: 20 },
                { header: 'القيمة', key: 'value', width: 20 }
            ];

            // Add borders to statistics
            statsSheet.eachRow((row, rowNumber) => {
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Generate filename
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `gym-members-${timestamp}.xlsx`;

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            // Send file
            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error('Export error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to export members data'
            });
        }
    }

    getPaymentStatusInArabic(status) {
        const statusMap = {
            'paid': 'مكتمل الدفع',
            'unpaid': 'غير مدفوع',
            'partial': 'دفع جزئي'
        };
        return statusMap[status] || status;
    }
}

module.exports = ExportController; 