import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../features/auth/providers/session_provider.dart';

class AppDrawerItem {
  final String   label;
  final IconData icon;
  final String   section;
  const AppDrawerItem({required this.label, required this.icon, required this.section});
}

class AppSidebar extends ConsumerWidget {
  final List<AppDrawerItem> items;
  final String              activeSection;
  final void Function(String section) onSectionTap;

  const AppSidebar({
    super.key,
    required this.items,
    required this.activeSection,
    required this.onSectionTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(sessionProvider)?.user;

    return Drawer(
      backgroundColor: AppColors.surfaceSidebar,
      width: 260,
      child: Column(
        children: [
          // Acento rojo superior
          Container(height: 4, color: AppColors.red700),

          // Brand
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
            child: Row(
              children: [
                Container(
                  width: 42, height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.red700,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.school, color: Colors.white, size: 22),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Unipamplona',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14),
                    ),
                    Text(_roleLabel(user?.role ?? ''),
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Divider(color: Colors.white10, height: 1),

          // Usuario
          if (user != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 14),
              child: Row(
                children: [
                  _avatar(user.initials, user.role),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user.fullName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                        Text(_roleLabel(user.role),
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.5),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          const Divider(color: Colors.white10, height: 1),

          // Nav items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
              children: items.map((item) => _navItem(item)).toList(),
            ),
          ),

          // Logout
          const Divider(color: Colors.white10, height: 1),
          Padding(
            padding: const EdgeInsets.all(10),
            child: _logoutButton(context, ref),
          ),
        ],
      ),
    );
  }

  Widget _navItem(AppDrawerItem item) {
    final isActive = activeSection == item.section;
    return GestureDetector(
      onTap: () => onSectionTap(item.section),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        margin: const EdgeInsets.only(bottom: 2),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
        decoration: BoxDecoration(
          color: isActive ? AppColors.red700 : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(item.icon, size: 18,
              color: isActive ? Colors.white : Colors.white60,
            ),
            const SizedBox(width: 12),
            Text(item.label,
              style: TextStyle(
                color: isActive ? Colors.white : Colors.white60,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _logoutButton(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: () async {
        await ref.read(sessionProvider.notifier).logout();
        if (context.mounted) context.go('/');
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(8)),
        child: Row(
          children: [
            const Icon(Icons.logout, size: 18, color: Colors.white60),
            const SizedBox(width: 12),
            Text('Cerrar sesión',
              style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  Widget _avatar(String initials, String role) {
    final color = role == 'SUPERUSER' ? AppColors.red700
                : role == 'ADMIN'     ? AppColors.red700
                : AppColors.blue700;
    return Container(
      width: 38, height: 38,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      child: Center(
        child: Text(initials,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
        ),
      ),
    );
  }

  String _roleLabel(String role) {
    switch (role) {
      case 'STUDENT':   return 'Portal Estudiantil';
      case 'TEACHER':   return 'Portal Docente';
      case 'ADMIN':     return 'Portal Administrativo';
      case 'SUPERUSER': return 'Superadministrador';
      default:          return role;
    }
  }
}