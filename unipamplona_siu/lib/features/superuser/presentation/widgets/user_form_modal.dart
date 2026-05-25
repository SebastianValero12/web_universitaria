import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/user_list_model.dart';

Future<Map<String, dynamic>?> showUserFormModal(
  BuildContext context, {
  UserListModel? user,
}) async {
  return showModalBottomSheet<Map<String, dynamic>>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _UserFormModal(user: user),
  );
}

class _UserFormModal extends StatefulWidget {
  final UserListModel? user;
  const _UserFormModal({this.user});

  @override
  State<_UserFormModal> createState() => _UserFormModalState();
}

class _UserFormModalState extends State<_UserFormModal> {
  final _formKey      = GlobalKey<FormState>();
  final _firstNameCtrl= TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _emailCtrl    = TextEditingController();
  final _passCtrl     = TextEditingController();
  String _role        = '';
  bool   _obscure     = true;

  bool get _isEdit => widget.user != null;

  static const _roles = [
    {'value':'STUDENT',   'label':'Estudiante'},
    {'value':'TEACHER',   'label':'Docente'},
    {'value':'ADMIN',     'label':'Administrador'},
    {'value':'SUPERUSER', 'label':'Superusuario'},
  ];

  @override
  void initState() {
    super.initState();
    if (_isEdit) {
      _firstNameCtrl.text = widget.user!.firstName;
      _lastNameCtrl.text  = widget.user!.lastName;
      _emailCtrl.text     = widget.user!.email;
      _role               = widget.user!.role;
    }
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
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
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: AppColors.gray300, borderRadius: BorderRadius.circular(999)),
                )),
                const SizedBox(height: 20),
                Text(_isEdit ? 'Editar usuario' : 'Crear usuario',
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18, color: AppColors.gray900),
                ),
                const SizedBox(height: 16),

                // Nombre + Apellido
                Row(children: [
                  Expanded(child: TextFormField(
                    controller: _firstNameCtrl,
                    decoration: const InputDecoration(labelText: 'Nombre *'),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
                  )),
                  const SizedBox(width: 12),
                  Expanded(child: TextFormField(
                    controller: _lastNameCtrl,
                    decoration: const InputDecoration(labelText: 'Apellido *'),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
                  )),
                ]),
                const SizedBox(height: 14),

                // Email
                TextFormField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Correo institucional *',
                    hintText: 'usuario@unipamplona.edu.co',
                    prefixIcon: Icon(Icons.email_outlined, size: 20),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Requerido';
                    if (!v.contains('@')) return 'Correo inválido';
                    return null;
                  },
                ),
                const SizedBox(height: 14),

                // Rol
                DropdownButtonFormField<String>(
                  value: _role.isEmpty ? null : _role,
                  decoration: const InputDecoration(
                    labelText: 'Rol *',
                    prefixIcon: Icon(Icons.badge_outlined, size: 20),
                  ),
                  items: _roles.map((r) => DropdownMenuItem(
                    value: r['value'],
                    child: Text(r['label']!),
                  )).toList(),
                  onChanged: (v) => setState(() => _role = v ?? ''),
                  validator: (v) => (v == null || v.isEmpty) ? 'Selecciona un rol' : null,
                ),
                const SizedBox(height: 14),

                // Contraseña (solo crear)
                if (!_isEdit)
                  TextFormField(
                    controller: _passCtrl,
                    obscureText: _obscure,
                    decoration: InputDecoration(
                      labelText: 'Contraseña *',
                      prefixIcon: const Icon(Icons.lock_outline, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                    ),
                    validator: (v) => (!_isEdit && (v == null || v.isEmpty)) ? 'Requerido al crear' : null,
                  ),
                if (!_isEdit) const SizedBox(height: 20),
                if (_isEdit) const SizedBox(height: 6),

                // Botones
                Row(children: [
                  Expanded(child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.gray300),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Cancelar', style: TextStyle(color: AppColors.gray700, fontWeight: FontWeight.w600)),
                  )),
                  const SizedBox(width: 12),
                  Expanded(child: ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        final payload = <String, dynamic>{
                          'firstName': _firstNameCtrl.text.trim(),
                          'lastName':  _lastNameCtrl.text.trim(),
                          'email':     _emailCtrl.text.trim(),
                          'role':      _role,
                        };
                        if (!_isEdit && _passCtrl.text.isNotEmpty) {
                          payload['password'] = _passCtrl.text;
                        }
                        Navigator.pop(context, payload);
                      }
                    },
                    style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                    child: Text(_isEdit ? 'Guardar cambios' : 'Crear usuario'),
                  )),
                ]),
              ],
            ),
          ),
        ),
      ),
    );
  }
}