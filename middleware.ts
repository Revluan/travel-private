import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)", "/trips(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\.(?:html|ico|svg|png|jpg|jpeg|gif|webp|css|js|txt|json|map|woff|woff2)).*)", "/"],
};
