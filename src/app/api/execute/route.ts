import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const command = searchParams.get('cmd');

  if (!command) {
    return NextResponse.json({ error: 'Command required' }, { status: 400 });
  }

  try {
    // This runs the command on the server
    const exec = require('child_process').exec;
    exec(command, { workdir: '/Users/neo2050/.openclaw/workspace' }, (error, stdout, stderr) => {
      const response = {
        success: !error,
        output: stdout || stderr,
        error: error ? error.message : null,
      };

      if (error) {
        console.error('Command execution error:', error);
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Command queued for execution'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command } = body;

    if (!command) {
      return NextResponse.json({ error: 'Command required' }, { status: 400 });
    }

    const exec = require('child_process').exec;
    const result = await new Promise((resolve, reject) => {
      exec(command, { workdir: '/Users/neo2050/.openclaw/workspace' }, (error, stdout, stderr) => {
        if (error) {
          reject({ success: false, error: error.message, output: stderr });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}