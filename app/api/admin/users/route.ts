import { NextResponse } from 'next/server';
import { saveUser } from '@/app/services/userService';
import { UserWithTokens } from '@/app/models/User';

// 添加新用户
export async function POST(request: Request) {
  try {
    // 验证管理员权限（这里应该有更完善的验证机制）
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // 验证必要字段
    if (!data.email || !data.name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // 创建新用户
    const user: UserWithTokens = {
      id: `user_${Date.now()}`, // 简单生成ID，实际应用中可能需要更复杂的ID生成策略
      email: data.email,
      name: data.name,
      picture: data.picture || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tokens: {}
    };

    // 保存用户
    const success = await saveUser(user);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'User added successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to save user' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 