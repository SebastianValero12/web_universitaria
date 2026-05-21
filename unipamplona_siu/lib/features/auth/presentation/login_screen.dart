import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/session_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey    = GlobalKey<FormState>();
  final _emailCtrl  = TextEditingController();
  final _passCtrl   = TextEditingController();

  String  _selectedRole = 'STUDENT';
  bool    _obscure      = true;
  bool    _loading      = false;
  String? _error;

  static const _roles = [
    {'value': 'STUDENT',   'label': 'Estudiante',             'icon': Icons.school_outlined},
    {'value': 'TEACHER',   'label': 'Docente / Administrativo','icon': Icons.person_outline},
    {'value': 'SUPERUSER', 'label': 'Superadministrador',     'icon': Icons.admin_panel_settings_outlined},
  ];

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });

    try {
      final notifier = ref.read(sessionProvider.notifier);
      if (_selectedRole == 'STUDENT') {
        await notifier.loginStudent(_emailCtrl.text.trim(), _passCtrl.text);
      } else {
        await notifier.loginAdmin(_emailCtrl.text.trim(), _passCtrl.text);
      }

      final session = ref.read(sessionProvider);
      if (session != null && mounted) {
        // Validar rol superuser
        if (_selectedRole == 'SUPERUSER' && session.user.role != 'SUPERUSER') {
          ref.read(sessionProvider.notifier).logout();
          setState(() { _error = 'Tu cuenta no tiene permisos de superadministrador.'; });
          return;
        }
        context.go(homeForRole(session.user.role));
      }
    } catch (e) {
      setState(() { _error = e.toString().replaceFirst('Exception: ', ''); });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfacePage,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                children: [
                  _buildHeader(),
                  const SizedBox(height: 32),
                  _buildCard(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: AppColors.red700,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: AppColors.red700.withValues(alpha: 0.35),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: const Icon(Icons.school, color: Colors.white, size: 36),
        ),
        const SizedBox(height: 16),
        Text(
          'Universidad de Pamplona',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: AppColors.gray900,
            fontSize: 18,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          'Sistema de Información Universitaria',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: AppColors.gray500,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildCard() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(28),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Iniciar sesión',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 22),
            ),
            const SizedBox(height: 4),
            Text('Selecciona tu tipo de acceso',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 20),

            // Selector de rol
            _buildRoleSelector(),
            const SizedBox(height: 20),

            // Email
            TextFormField(
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Correo institucional',
                hintText: 'usuario@unipamplona.edu.co',
                prefixIcon: Icon(Icons.email_outlined, size: 20),
              ),
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Campo requerido';
                if (!v.contains('@')) return 'Correo inválido';
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Contraseña
            TextFormField(
              controller: _passCtrl,
              obscureText: _obscure,
              decoration: InputDecoration(
                labelText: 'Contraseña',
                hintText: '••••••••',
                prefixIcon: const Icon(Icons.lock_outline, size: 20),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                    size: 20,
                    color: AppColors.gray500,
                  ),
                  onPressed: () => setState(() => _obscure = !_obscure),
                ),
              ),
              validator: (v) => (v == null || v.isEmpty) ? 'Campo requerido' : null,
              onFieldSubmitted: (_) => _submit(),
            ),
            const SizedBox(height: 20),

            // Error
            if (_error != null) _buildError(),

            // Botón
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                  ? const SizedBox(
                      width: 20, height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Ingresar al portal'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleSelector() {
    return Column(
      children: _roles.map((role) {
        final selected = _selectedRole == role['value'];
        return GestureDetector(
          onTap: () => setState(() {
            _selectedRole = role['value'] as String;
            _error = null;
          }),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: selected ? AppColors.red50 : AppColors.gray50,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: selected ? AppColors.red700 : AppColors.gray200,
                width: selected ? 2 : 1.5,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  role['icon'] as IconData,
                  size: 20,
                  color: selected ? AppColors.red700 : AppColors.gray500,
                ),
                const SizedBox(width: 12),
                Text(
                  role['label'] as String,
                  style: TextStyle(
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                    color: selected ? AppColors.red700 : AppColors.gray700,
                    fontSize: 14,
                  ),
                ),
                const Spacer(),
                if (selected)
                  const Icon(Icons.check_circle, color: AppColors.red700, size: 18),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildError() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.dangerBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.red100),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppColors.danger, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _error!,
              style: const TextStyle(
                color: AppColors.danger,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}