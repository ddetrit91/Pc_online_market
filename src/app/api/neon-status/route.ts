import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNeonS3Client } from '@/lib/storage';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    postgres: { status: 'checking' },
    objectStorage: { status: 'checking' },
    functions: { status: 'checking' },
  };

  // 1. Test Neon PostgreSQL
  try {
    const [productsCount, gamesCount, ordersCount] = await Promise.all([
      prisma.product.count(),
      prisma.game.count(),
      prisma.order.count(),
    ]);
    results.postgres = {
      status: 'healthy',
      provider: 'Neon PostgreSQL',
      productsCount,
      gamesCount,
      ordersCount,
    };
  } catch (error: any) {
    results.postgres = {
      status: 'error',
      message: error?.message || 'Database connection error',
    };
  }

  // 2. Test Neon Object Storage (S3 API)
  try {
    const s3 = getNeonS3Client();
    const listRes = await s3.send(
      new ListObjectsV2Command({
        Bucket: 'assets',
        MaxKeys: 10,
      })
    );
    results.objectStorage = {
      status: 'healthy',
      bucket: 'assets',
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      region: process.env.AWS_REGION || 'us-east-2',
      objectsFound: listRes.Contents?.length || 0,
    };
  } catch (error: any) {
    results.objectStorage = {
      status: 'error',
      message: error?.message || 'S3 Object Storage error',
    };
  }

  // 3. Test Neon Functions
  try {
    const branchId = process.env.NEON_BRANCH_ID;
    const hostSuffix = process.env.NEON_FUNCTION_HOST_SUFFIX;
    if (!branchId || !hostSuffix) {
      results.functions = { status: 'not_configured' };
    } else {
      const funcUrl = `https://${branchId}-hello${hostSuffix}/`;
      const funcRes = await fetch(funcUrl);
      const funcText = await funcRes.text();
      results.functions = {
        status: funcRes.ok ? 'healthy' : 'error',
        httpStatus: funcRes.status,
        response: funcText.trim(),
      };
    }
  } catch (error: any) {
    results.functions = {
      status: 'error',
      message: error?.message || 'Function execution error',
    };
  }

  return NextResponse.json(results);
}
