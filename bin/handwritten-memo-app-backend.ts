#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { HandwrittenMemoAppBackendStack } from '../lib/handwritten-memo-app-backend-stack';

const app = new cdk.App();
new HandwrittenMemoAppBackendStack(app, 'HandwrittenMemoAppBackendStack');
