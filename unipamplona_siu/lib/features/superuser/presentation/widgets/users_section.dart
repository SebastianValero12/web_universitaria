import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/dashboard_card.dart';
import '../../../../shared/widgets/role_badge.dart';
import '../../../../shared/widgets/confirm_dialog.dart';
import '../../../../shared/widgets/app_snackbar.dart';
import '../../domain/user_list_model.dart';
import '../../providers/superuser_provider.dart';
import 'user_form_modal.dart';

class UsersSection extends ConsumerWidget {
  const UsersSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(usersProvider);

    return DashboardCard(
      child: Column(
        children: [
          // Header
          CardHeader(
            title: 'Gestión de usuarios',
            icon: Icons.manage_accounts_outlined,
            trailing: ElevatedButton.icon(
              onPressed: () => _openCreate(context, ref),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('Nuevo', style: TextStyle(fontSize: 12)),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                textStyle: const TextStyle(fontSize: 12),
              ),
            ),
          ),

          // Filtros
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
            child: Column(children: [
              // Búsqueda
              TextField(
                onChanged: (v) => ref.read(usersProvider.notifier).applyFilters(search: v),
                decoration: InputDecoration(
                  hintText: 'Buscar por nombre, correo o código...',
                  prefixIcon: const Icon(Icons.search, size: 20),
                  filled: true, fillColor: AppColors.gray50,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.gray200)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.gray200)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                ),
              ),
              const SizedBox(height: 10),
              // Dropdowns rol + estado
              Row(children: [
                Expanded(child: _filterDropdown(
                  hint: 'Todos los roles',
                  value: state.roleFilter.isEmpty ? null : state.roleFilter,
                  items: const [
                    DropdownMenuItem(value: 'STUDENT',   child: Text('Estudiante',    style: TextStyle(fontSize: 13))),
                    DropdownMenuItem(value: 'TEACHER',   child: Text('Docente',       style: TextStyle(fontSize: 13))),
                    DropdownMenuItem(value: 'ADMIN',     child: Text('Admin',         style: TextStyle(fontSize: 13))),
                    DropdownMenuItem(value: 'SUPERUSER', child: Text('Superusuario',  style: TextStyle(fontSize: 13))),
                  ],
                  onChanged: (v) => ref.read(usersProvider.notifier).applyFilters(role: v ?? ''),
                )),
                const SizedBox(width: 10),
                Expanded(child: _filterDropdown(
                  hint: 'Todos los estados',
                  value: state.statusFilter.isEmpty ? null : state.statusFilter,
                  items: const [
                    DropdownMenuItem(value: 'ACTIVE',    child: Text('Activo',     style: TextStyle(fontSize: 13))),
                    DropdownMenuItem(value: 'INACTIVE',  child: Text('Inactivo',   style: TextStyle(fontSize: 13))),
                    DropdownMenuItem(value: 'SUSPENDED', child: Text('Suspendido', style: TextStyle(fontSize: 13))),
                  ],
                  onChanged: (v) => ref.read(usersProvider.notifier).applyFilters(status: v ?? ''),
                )),
              ]),
            ]),
          ),

          const SizedBox(height: 10),
          const Divider(height: 1, color: AppColors.gray100),

          // Lista paginada
          if (state.filtered.isEmpty)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Text('Sin usuarios que coincidan.', style: TextStyle(color: AppColors.gray500)),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: state.pageUsers.length,
              separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.gray100),
              itemBuilder: (_, i) => _userRow(context, ref, state.pageUsers[i]),
            ),

          // Footer paginación
          if (state.filtered.isNotEmpty)
            _buildPagination(context, ref, state),
        ],
      ),
    );
  }

  Widget _filterDropdown({
    required String hint,
    required String? value,
    required List<DropdownMenuItem<String>> items,
    required void Function(String?) onChanged,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        filled: true, fillColor: AppColors.gray50,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border:        OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.gray200)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.gray200)),
      ),
      hint: Text(hint, style: const TextStyle(fontSize: 12, color: AppColors.gray500)),
      items: items,
      onChanged: onChanged,
      isExpanded: true,
    );
  }

  Widget _userRow(BuildContext context, WidgetRef ref, UserListModel u) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 38, height: 38,
            decoration: BoxDecoration(
              color: u.role == 'SUPERUSER' || u.role == 'ADMIN' ? AppColors.red700 : AppColors.blue700,
              shape: BoxShape.circle,
            ),
            child: Center(child: Text(u.initials,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13))),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(u.fullName,
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.gray900),
                maxLines: 1, overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Row(children: [
                RoleBadge(role: u.role),
                const SizedBox(width: 6),
                StatusBadge(status: u.status),
              ]),
            ]),
          ),

          // Acciones
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, size: 18, color: AppColors.gray500),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'edit',   child: Row(children: [Icon(Icons.edit_outlined,   size: 16), SizedBox(width: 8), Text('Editar',  style: TextStyle(fontSize: 13))])),
              PopupMenuItem(value: 'toggle', child: Row(children: [
                Icon(u.status == 'ACTIVE' ? Icons.block_outlined : Icons.check_circle_outline, size: 16),
                const SizedBox(width: 8),
                Text(u.status == 'ACTIVE' ? 'Desactivar' : 'Activar', style: const TextStyle(fontSize: 13)),
              ])),
              const PopupMenuItem(value: 'delete', child: Row(children: [Icon(Icons.delete_outline,  size: 16, color: AppColors.danger), SizedBox(width: 8), Text('Eliminar', style: TextStyle(fontSize: 13, color: AppColors.danger))])),
            ],
            onSelected: (action) => _handleAction(context, ref, u, action),
          ),
        ],
      ),
    );
  }

  Future<void> _handleAction(BuildContext context, WidgetRef ref, UserListModel u, String action) async {
    switch (action) {
      case 'edit':
        final result = await showUserFormModal(context, user: u);
        if (result != null && context.mounted) {
          await ref.read(usersProvider.notifier).updateUser(u.id, result);
          showAppSnackbar(context, title: 'Guardado', message: 'Usuario actualizado.', type: SnackType.success);
        }
        break;

      case 'toggle':
        final confirm = await showConfirmDialog(context,
          message: '¿${u.status == 'ACTIVE' ? 'Desactivar' : 'Activar'} a ${u.fullName}?',
          type: u.status == 'ACTIVE' ? ConfirmType.warning : ConfirmType.success,
          confirmText: u.status == 'ACTIVE' ? 'Desactivar' : 'Activar',
        );
        if (confirm && context.mounted) {
          await ref.read(usersProvider.notifier).toggleStatus(u.id);
          showAppSnackbar(context, title: 'Actualizado', message: 'Estado cambiado.', type: SnackType.success);
        }
        break;

      case 'delete':
        final confirm = await showConfirmDialog(context,
          message: '¿Eliminar permanentemente a ${u.fullName}? Esta acción no se puede deshacer.',
          confirmText: 'Eliminar',
        );
        if (confirm && context.mounted) {
          await ref.read(usersProvider.notifier).deleteUser(u.id);
          showAppSnackbar(context, title: 'Eliminado', message: 'Usuario eliminado.', type: SnackType.error);
        }
        break;
    }
  }

  Future<void> _openCreate(BuildContext context, WidgetRef ref) async {
    final result = await showUserFormModal(context);
    if (result != null && context.mounted) {
      await ref.read(usersProvider.notifier).createUser(result);
      showAppSnackbar(context, title: 'Creado', message: 'Usuario creado correctamente.', type: SnackType.success);
    }
  }

  Widget _buildPagination(BuildContext context, WidgetRef ref, UsersState state) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Text(
            'Mostrando ${((state.currentPage - 1) * UsersState.perPage) + 1}–'
            '${(state.currentPage * UsersState.perPage).clamp(0, state.filtered.length)} '
            'de ${state.filtered.length}',
            style: const TextStyle(fontSize: 12, color: AppColors.gray500),
          ),
          const Spacer(),
          Row(children: [
            _pageBtn(
              icon: Icons.chevron_left,
              enabled: state.currentPage > 1,
              onTap: () => ref.read(usersProvider.notifier).goPage(state.currentPage - 1),
            ),
            ...List.generate(state.totalPages, (i) {
              final page = i + 1;
              final active = page == state.currentPage;
              return GestureDetector(
                onTap: () => ref.read(usersProvider.notifier).goPage(page),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  width: 32, height: 32,
                  decoration: BoxDecoration(
                    color: active ? AppColors.blue700 : AppColors.surfaceCard,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: active ? AppColors.blue700 : AppColors.gray200),
                  ),
                  child: Center(child: Text('$page',
                    style: TextStyle(
                      fontSize: 12, fontWeight: FontWeight.w600,
                      color: active ? Colors.white : AppColors.gray700,
                    ),
                  )),
                ),
              );
            }),
            _pageBtn(
              icon: Icons.chevron_right,
              enabled: state.currentPage < state.totalPages,
              onTap: () => ref.read(usersProvider.notifier).goPage(state.currentPage + 1),
            ),
          ]),
        ],
      ),
    );
  }

  Widget _pageBtn({required IconData icon, required bool enabled, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        width: 32, height: 32,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        decoration: BoxDecoration(
          color: AppColors.surfaceCard,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: AppColors.gray200),
        ),
        child: Icon(icon, size: 18, color: enabled ? AppColors.gray700 : AppColors.gray300),
      ),
    );
  }
}