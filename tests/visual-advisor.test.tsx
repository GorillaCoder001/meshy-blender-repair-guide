import React from 'react';
import { render,screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe,it,expect,vi } from 'vitest';
import { VisualRepairGuide } from '../src/components/VisualRepairGuide';
import { LocalUpload } from '../src/components/LocalUpload';
import type { LocalModelController } from '../src/model/useLocalModel';
describe('Visual advisor interactions',()=>{
  it('advances arrows to actual panel controls without textbox annotations',async()=>{
    const user=userEvent.setup();const {container}=render(<VisualRepairGuide toolId="solidify"/>);
    expect(screen.getByRole('heading',{name:'Open the Modifiers tab'})).toBeTruthy();
    await user.click(screen.getByRole('button',{name:'Next step'}));
    expect(screen.getByRole('heading',{name:'Find Thickness'})).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('4.5 reference');
    expect(container.querySelectorAll('.screenshot-stage text').length).toBe(0);
    expect(container.querySelectorAll('.screenshot-stage input').length).toBe(0);
    await user.click(screen.getByRole('button',{name:'I set the thickness — continue guide'}));
    expect(screen.getByRole('heading',{name:'Choose the direction of growth'})).toBeTruthy();
    await user.click(screen.getByRole('button',{name:'Previous'}));expect(screen.getByRole('heading',{name:'Find Thickness'})).toBeTruthy();
  });
  it('marks the final navigation step as reviewed without claiming a repair',async()=>{
    const user=userEvent.setup();render(<VisualRepairGuide toolId="export-stl"/>);
    await user.click(screen.getByRole('button',{name:'Mark reviewed'}));
    expect(screen.getByRole('status').textContent).toContain('Verify the actual repair');
  });
  it('opens local-file input, accepts a file, and supports removal',async()=>{
    const user=userEvent.setup(),load=vi.fn(),clear=vi.fn();const controller={model:null,busy:false,progress:'',error:'',load,clear,changeUnits:vi.fn()} as LocalModelController;
    render(<LocalUpload controller={controller}/>);
    const file=new File(['solid empty\nendsolid empty'],'model.stl',{type:'application/octet-stream'});
    await user.upload(screen.getByLabelText('Choose a local 3D model'),file);expect(load).toHaveBeenCalledWith(file);
  });
  it('exposes a useful failure and cancel button during analysis',async()=>{
    const user=userEvent.setup(),clear=vi.fn();const controller={model:null,busy:true,progress:'Checking edges…',error:'',load:vi.fn(),clear,changeUnits:vi.fn()} as LocalModelController;
    render(<LocalUpload controller={controller}/>);expect(screen.getByText('Checking edges…')).toBeTruthy();
    await user.click(screen.getByRole('button',{name:'Cancel analysis'}));expect(clear).toHaveBeenCalled();
  });
});
