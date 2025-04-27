import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log("Auth check API called");
  
  // Verifica se há um cookie de autenticação
  const authToken = req.cookies.get('auth_token')?.value;
  const userInfo = req.cookies.get('user_info')?.value;
  
  if (userInfo) {
    try {
      const user = JSON.parse(decodeURIComponent(userInfo));
      
      return NextResponse.json({
        authenticated: true,
        user: user,
        source: 'user_info cookie'
      });
    } catch (error) {
      console.error("Erro ao processar cookie user_info:", error);
    }
  }
  
  if (authToken) {
    return NextResponse.json({
      authenticated: true,
      authTokenExists: true,
      source: 'auth_token cookie'
    });
  }
  
  // Verificar se há dados de usuário no localStorage (apenas para documentação)
  return NextResponse.json({
    authenticated: false,
    message: 'Nenhuma sessão autenticada encontrada',
    apiNote: 'O localStorage seria verificado no cliente, não na API'
  });
}
