# Backend CEPEID

## Dependencias

```bash
cd BACK
npm install
```

## Ejecutar

```bash
npm run dev
```

## Qué hace

- `/api/auth/login`: login con `telefono` o `usuario` y `pin`
- `/api/auth/logout`: cierra sesión
- `/api/reportes`: guarda reportes (requiere token)
- `/api/health`: verifica que la API esté viva

## Cómo funciona la sesión

- El backend genera un `token` cuando el usuario ingresa correctamente.
- El frontend guarda ese token en `localStorage` si el usuario elige mantener sesión.
- Para cada petición protegida, el frontend envía el header `Authorization: Bearer <token>`.
- Si la sesión expira o el token no es válido, el backend devuelve `401`.

## Escenarios de rutas

- Si alguien entra a una ruta sin estar autenticado, el frontend debe redirigirlo a `/`.
- Esa lógica se maneja en el propio frontend leyendo `localStorage` y el estado de sesión.
