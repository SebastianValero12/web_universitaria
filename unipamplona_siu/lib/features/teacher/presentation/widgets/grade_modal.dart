import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

Future<Map<String, dynamic>?> showGradeModal(
  BuildContext context, {
  required String studentName,
  double? currentScore,
}) async {
  return showModalBottomSheet<Map<String, dynamic>>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _GradeModal(studentName: studentName, currentScore: currentScore),
  );
}

class _GradeModal extends StatefulWidget {
  final String  studentName;
  final double? currentScore;
  const _GradeModal({required this.studentName, this.currentScore});

  @override
  State<_GradeModal> createState() => _GradeModalState();
}

class _GradeModalState extends State<_GradeModal> {
  final _formKey     = GlobalKey<FormState>();
  final _scoreCtrl   = TextEditingController();
  final _remarksCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.currentScore != null && widget.currentScore! > 0) {
      _scoreCtrl.text = widget.currentScore!.toStringAsFixed(1);
    }
  }

  @override
  void dispose() {
    _scoreCtrl.dispose();
    _remarksCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: AppColors.surfaceCard,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.gray300,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text('Registrar calificación',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18, color: AppColors.gray900),
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: widget.studentName,
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: 'Estudiante',
                  prefixIcon: Icon(Icons.person_outline, size: 20),
                ),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _scoreCtrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Nota (0.0 – 5.0)',
                  hintText: 'Ej: 3.8',
                  prefixIcon: Icon(Icons.grade_outlined, size: 20),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Campo requerido';
                  final n = double.tryParse(v);
                  if (n == null || n < 0 || n > 5) return 'Nota entre 0.0 y 5.0';
                  return null;
                },
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _remarksCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Observaciones (opcional)',
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.gray300),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Cancelar',
                        style: TextStyle(color: AppColors.gray700, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          Navigator.pop(context, {
                            'score':   double.parse(_scoreCtrl.text),
                            'remarks': _remarksCtrl.text,
                          });
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text('Guardar nota'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}